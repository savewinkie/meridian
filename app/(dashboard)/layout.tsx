import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#070d1a]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto dot-grid-dark">
        {children}
      </main>
    </div>
  )
}
