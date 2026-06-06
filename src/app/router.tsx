import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { AuthGuard } from '@/features/auth/components/AuthGuard'

function Loader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function lazy_page(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory)
  return (
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: lazy_page(() => import('@/features/calendar/pages/CalendarPage')) },
      { path: 'standings', element: lazy_page(() => import('@/features/standings/pages/StandingsPage')) },
      { path: 'bracket', element: lazy_page(() => import('@/features/bracket/pages/BracketPage')) },
      { path: 'simulator', element: lazy_page(() => import('@/features/simulator/pages/SimulatorPage')) },
      { path: 'simulador', element: lazy_page(() => import('@/features/simulator/pages/SimulatorPage')) },
      {
        path: 'pool',
        element: lazy_page(() => import('@/features/pool/pages/PoolPage')),
      },
      {
        path: 'pool/league/new',
        element: <AuthGuard>{lazy_page(() => import('@/features/pool/pages/CreateLeaguePage'))}</AuthGuard>,
      },
      {
        path: 'pool/league/:leagueId',
        element: <AuthGuard>{lazy_page(() => import('@/features/pool/pages/LeaguePage'))}</AuthGuard>,
      },
      {
        path: 'pool/join',
        element: <AuthGuard>{lazy_page(() => import('@/features/pool/pages/JoinLeaguePage'))}</AuthGuard>,
      },
      {
        path: 'pool/join/:inviteCode',
        element: <AuthGuard>{lazy_page(() => import('@/features/pool/pages/JoinLeaguePage'))}</AuthGuard>,
      },
      {
        path: 'my-team',
        element: lazy_page(() => import('@/features/custom-team/pages/CustomTeamPage')),
      },
      {
        path: 'u/:userId',
        element: lazy_page(() => import('@/features/profile/pages/ProfilePage')),
      },
    ],
  },
])
