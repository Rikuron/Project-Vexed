/**
  * Cockpit — API Key Pool Rotation for Vexed (Serverless)
  *
  * Firebase App Hosting / Vercel / Railway — env var only.
  * No filesystem access. No state persistence.
  *
  * Set COCKPIT_KEYS as a JSON array in your Firebase env config:      
  *   COCKPIT_KEYS=[{"id":"main","apiKey":"sk-..."},{"id":"alt-1","apiKey":"sk-..."}]
  *
  * @module cockpit
  */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type KeyStatus = 'active' | 'session_exhausted' | 'weekly_exhausted'

export interface PoolKeyConfig {
  id: string
  apiKey: string
}

interface PoolKeyState {
  id: string
  status: KeyStatus
  exhaustedAt?: number
  totalRequests: number
  totalFailures: number
}

interface PoolConfig {
  provider: string
  keys: PoolKeyConfig[]
}

interface PoolState {
  provider: string
  activeIndex: number
  keys: PoolKeyState[]
}

export interface PoolSnapshot {
  provider: string
  totalKeys: number
  activeKeyId: string
  activeIndex: number
  keys: Array<{
    id: string
    status: KeyStatus
    totalRequests: number
    totalFailures: number
  }>
  allExhausted: boolean
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const DEFAULT_PROVIDER = 'ollama-cloud'
const SESSION_RECOVERY_MS = 5 * 60 * 60 * 1000    // 5 hours
const WEEKLY_RECOVERY_MS  = 24 * 60 * 60 * 1000   // 24 hours
const RAPID_429_WINDOW_MS = 30_000                 // 30 seconds

// ═══════════════════════════════════════════════════════════
// CONFIG LOADING 
// ═══════════════════════════════════════════════════════════

function loadConfig(): { pools: Record<string, PoolConfig> } {
  const envKeys = process.env.COCKPIT_KEYS
  if (!envKeys) return { pools: {} }

  try {
    const keys: PoolKeyConfig[] = JSON.parse(envKeys)
    if (!Array.isArray(keys) || keys.length === 0) return { pools: {} }

    return {
      pools: {
        [DEFAULT_PROVIDER]: {
          provider: DEFAULT_PROVIDER,
          keys
        }
      }
    }
  } catch (e) {
    console.error('[cockpit] Failed to parse COCKPIT_KEYS:', e)
    return { pools: {} }
  }
}

// ═══════════════════════════════════════════════════════════
// POOL MANAGER 
// ═══════════════════════════════════════════════════════════

let _state: { pools: Record<string, PoolState> } | undefined
let _initialized = false

function defaultKeyState(id: string): PoolKeyState {
  return {
    id,
    status: 'active',
    totalRequests: 0,
    totalFailures: 0,
  }
}

function ensureInit(): void {
  if (_initialized) return

  const config = loadConfig()
  _state = { pools: {} }

  for (const [provider, poolCfg] of Object.entries(config.pools)) {
    _state.pools[provider] = {
      provider,
      activeIndex: 0,
      keys: poolCfg.keys.map((k) => defaultKeyState(k.id))
    }
  }

  _initialized = true
}

// ═══════════════════════════════════════════════════════════        
// QUERY
// ═══════════════════════════════════════════════════════════

export function hasCockpitPool(provider: string): boolean {
  if (_initialized && _state?.pools[provider]) {
    return _state.pools[provider].keys.length > 0
  }

  if (process.env.COCKPIT_KEYS) {
    try {
      const keys = JSON.parse(process.env.COCKPIT_KEYS)
      if (Array.isArray(keys) && keys.length > 0) {
        ensureInit()
        return true
      }
    } catch { /* fall through */ }
  } 

  return false
}

export function getPoolSnapshot(provider: string): PoolSnapshot | undefined {
  ensureInit()
  const pool = _state?.pools[provider]
  if (!pool || pool.keys.length === 0) return undefined

  return {
    provider,
    totalKeys: pool.keys.length,
    activeKeyId: pool.keys[pool.activeIndex]?.id ?? 'unknown',
    activeIndex: pool.activeIndex,
    keys: pool.keys.map((k) => ({
      id: k.id,
      status: k.status,
      totalRequests: k.totalRequests,
      totalFailures: k.totalFailures
    })),
    allExhausted: pool.keys.every((k) => k.status !== 'active')
  }
}

// ═══════════════════════════════════════════════════════════        
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════
function getActiveKey(provider: string): (PoolKeyConfig & { _stateIndex: number }) | undefined {
  const pool = _state?.pools[provider]
  if (!pool || pool.keys.length === 0) return undefined

  const configKeys = loadConfig().pools[provider]?.keys ?? []

  for (let i = 0; i < pool.keys.length; i++) {
    const idx = (pool.activeIndex + i) % pool.keys.length
    const keyState = pool.keys[idx]

    // Auto-recover session exhaustion
    if (keyState.status === 'session_exhausted' && keyState.exhaustedAt) {
      if (Date.now() - keyState.exhaustedAt > SESSION_RECOVERY_MS) {
        keyState.status = 'active'
        keyState.exhaustedAt = undefined
      }
    }

    // Auto-recover weekly exhaustion
    if (keyState.status === 'weekly_exhausted' && keyState.exhaustedAt) {
      if (Date.now() - keyState.exhaustedAt > WEEKLY_RECOVERY_MS) {
        keyState.status = 'active'
        keyState.exhaustedAt = undefined
      }
    }

    if (keyState.status === 'active') {
      pool.activeIndex = idx
      const cfgKey = configKeys.find((c) => c.id === keyState.id)
      if (cfgKey) {
        return { ...cfgKey, _stateIndex: idx }
      }
    }
  }

  return undefined
}

function rotateToNext(provider: string): void {
  const pool = _state?.pools[provider]
  if (!pool) return
  pool.activeIndex = (pool.activeIndex + 1) % pool.keys.length
}

function markExhausted(
  provider: string,
  keyId: string,
  type: 'session_exhausted' | 'weekly_exhausted',
): void {
  const pool = _state?.pools[provider]
  if (!pool) return

  const key = pool.keys.find((k) => k.id === keyId)
  if (!key) return

  // Rapid re-429 escalation
  if (key.status === 'session_exhausted' && type === 'session_exhausted') {
    const elapsed = key.exhaustedAt ? Date.now() - key.exhaustedAt : Infinity
    if (elapsed < RAPID_429_WINDOW_MS) type = 'weekly_exhausted'
  }

  key.status = type
  key.exhaustedAt = Date.now()
  key.totalFailures++
}

function recordUsage(provider: string, keyId: string): void {
  const pool = _state?.pools[provider]
  if (!pool) return
  const key = pool.keys.find((k) => k.id === keyId)
  if (!key) return
  key.totalRequests++
}

// ═══════════════════════════════════════════════════════════
// FETCH INTERCEPTOR  (the main thing your code uses)
// ═══════════════════════════════════════════════════════════

/**
 * Create a cockpit-aware fetch function that auto-rotates API keys on 429.
 *
 * Drop-in replacement for `fetch()` — same signature, same return type.
 * If no cockpit pool is configured for the provider, it just passes through
 * to the normal fetch.
 *
 * @param providerID - Pool name (e.g. "ollama-cloud")
 * @param baseFetch  - The underlying fetch to wrap (default: globalThis.fetch)
 *
 * @example
 *   const apiFetch = cockpitFetch('ollama-cloud')
 *   const res = await apiFetch('https://api.ollama.ai/v1/chat/completions', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ model: 'kimi-k2.6', messages: [...] }),
 *   })
 */
export function cockpitFetch(
  providerID: string,
  baseFetch: typeof fetch = globalThis.fetch,
): typeof fetch {
  return (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    // No pool → pass through
    if (!hasCockpitPool(providerID)) return baseFetch(input, init)

    ensureInit()

    const activeKey = getActiveKey(providerID)
    if (!activeKey) {
      console.warn('[cockpit] ALL KEYS EXHAUSTED — request may fail')
      return baseFetch(input, init)
    }

    // Patch Authorization header with the cockpit's active key
    const patched = patchAuthHeader(init, activeKey.apiKey)

    // Track request
    recordUsage(providerID, activeKey.id)

    const response = await baseFetch(input, patched)

    // 429 → mark exhausted + rotate for the NEXT request
    if (response.status === 429) {
      const body = await response.clone().text().catch(() => '')
      const isWeekly = body.includes('weekly')
      const keyId = activeKey.id

      markExhausted(providerID, keyId, isWeekly ? 'weekly_exhausted' : 'session_exhausted')
      rotateToNext(providerID)

      const nextKey = getActiveKey(providerID)
      console.warn(
        `[cockpit] 429 on key "${keyId}" (${isWeekly ? 'weekly' : 'session'})` +
        (nextKey ? ` → rotated to "${nextKey.id}"` : ' → ALL KEYS EXHAUSTED'),
      )
    }

    return response
  }) as typeof fetch
}

function patchAuthHeader(init: RequestInit | undefined, apiKey: string): RequestInit {
  const patched = { ...init }
  if (patched.headers instanceof Headers) {
    patched.headers = new Headers(patched.headers)
    patched.headers.set('Authorization', `Bearer ${apiKey}`)
  } else if (patched.headers && typeof patched.headers === 'object') {
    patched.headers = {
      ...(patched.headers as Record<string, string>),
      Authorization: `Bearer ${apiKey}`,
    }
  } else {
    patched.headers = { Authorization: `Bearer ${apiKey}` }
  }
  return patched
}