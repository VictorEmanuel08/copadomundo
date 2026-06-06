import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 pb-24 pt-4 sm:px-4 md:pb-8 lg:px-6">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
    </div>
  )
}
