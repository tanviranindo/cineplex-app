import { NavLink } from 'react-router-dom'
import { Home, Search, Compass, BookmarkCheck, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const ALL_ITEMS = [
  { to: '/', icon: Home, label: 'Home', requiresAuth: false },
  { to: '/search', icon: Search, label: 'Search', requiresAuth: false },
  { to: '/browse', icon: Compass, label: 'Browse', requiresAuth: false },
  { to: '/watchlist', icon: BookmarkCheck, label: 'Watchlist', requiresAuth: true },
  { to: '/account', icon: User, label: 'Account', requiresAuth: true },
]

export default function BottomNav() {
  const user = useAuthStore((s) => s.user)
  const items = ALL_ITEMS.filter((item) => !item.requiresAuth || user)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden glass border-t border-white/10">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors text-xs font-medium ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
