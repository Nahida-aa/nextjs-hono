import Link from 'next/link'
import { Home, Search, PlusSquare, User } from 'lucide-react'

interface AppNavBarProps {
  isLoggedIn: boolean
}

export default function AppNavBar({ isLoggedIn }: AppNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between">
          <Link href="/" className="flex flex-col items-center py-2">
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center py-2">
            <Search className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </Link>
          {isLoggedIn && (
            <Link href="/create" className="flex flex-col items-center py-2">
              <PlusSquare className="h-6 w-6" />
              <span className="text-xs">Create</span>
            </Link>
          )}
          <Link href={isLoggedIn ? "/profile" : "/login"} className="flex flex-col items-center py-2">
            <User className="h-6 w-6" />
            <span className="text-xs">{isLoggedIn ? "Profile" : "Login"}</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

