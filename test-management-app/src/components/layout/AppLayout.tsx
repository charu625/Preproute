import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const TEST_PREVIEW_PATH = /^\/tests\/[^/]+\/preview$/

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    isActive: (path: string) => path === '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    to: '/tests/new',
    label: 'Test Creation',
    isActive: (path: string) => path.startsWith('/tests') && !TEST_PREVIEW_PATH.test(path),
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  {
    to: '/dashboard',
    label: 'Test Tracking',
    isActive: (path: string) => TEST_PREVIEW_PATH.test(path),
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
]

function HamburgerIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onNavigate}
          className={() => {
            const active = item.isActive(pathname)
            return `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? 'bg-brand-50 text-brand-600 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-r before:bg-brand-500'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBrand() {
  return <span className="text-xl font-bold text-brand-500">Preproute</span>
}

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavSessionPath, setMobileNavSessionPath] = useState<string | null>(null)

  const mobileNavOpen =
    mobileNavSessionPath !== null && mobileNavSessionPath === location.pathname

  const openMobileNav = () => setMobileNavSessionPath(location.pathname)

  const closeMobileNav = () => setMobileNavSessionPath(null)

  const toggleMobileNav = () => {
    if (mobileNavOpen) closeMobileNav()
    else openMobileNav()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!mobileNavOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileNav()
    }

    document.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [mobileNavOpen])

  return (
    <div className="flex min-h-screen min-w-0 bg-surface">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-white lg:flex">
        <div className="border-b border-border px-5 py-5">
          <SidebarBrand />
        </div>
        <SidebarNav pathname={location.pathname} />
      </aside>

      <div className="lg:hidden">
        {mobileNavOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close menu"
            onClick={closeMobileNav}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!mobileNavOpen}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-5">
            <SidebarBrand />
            <button
              type="button"
              onClick={closeMobileNav}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <SidebarNav pathname={location.pathname} onNavigate={closeMobileNav} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              onClick={toggleMobileNav}
            >
              <HamburgerIcon />
            </button>
            <span className="text-lg font-bold text-brand-500 lg:hidden">
              <SidebarBrand />
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-success" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
                {(user?.name ?? user?.userId ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name || user?.userId || 'User'}
                </p>
                <p className="text-xs text-muted">Admin</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-muted hover:text-brand-600 sm:ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
