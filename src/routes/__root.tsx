import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider, useAuth } from '../lib/auth/AuthContext'
import { SidebarProvider, useSidebar } from '../lib/sidebar'
import Sidebar from '../components/Sidebar'

import appCss from '../styles.css?url'
import LoadingScreen from '@/components/LoadingScreen'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vexed — Turn frustrations into missions' },
      { name: 'description', content: 'Submit real-world problems and let developers build solutions. A problem-first platform connecting frustrations with builders.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <SidebarProvider>
            <AppLayout>{children}</AppLayout>

            <TanStackDevtools
              config={{ position: 'bottom-right' }}
              plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
            />
          </SidebarProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const { loading } = useAuth()

  const routerState = useRouterState()
  const isSignInPage = routerState.location.pathname === '/signIn'

  if (loading) return <LoadingScreen />

  if (isSignInPage) return (
    <div className="min-h-screen">
      <main>
        {children}
      </main>
    </div>
  )

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-300"
          style={{ paddingLeft: `var(--sidebar-offset, 0px)` }}
        >
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <style>{`
        @media (min-width: 1024px) {
          :root { --sidebar-offset: ${collapsed ? 64 : 230}px; }
        }
      `}</style>
    </>
  )
}