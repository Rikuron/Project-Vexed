import { createContext, useContext, useState } from 'react'

type SidebarContextType = {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((prev) => !prev) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}