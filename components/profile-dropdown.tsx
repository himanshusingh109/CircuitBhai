"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, LayoutDashboard, LogOut, UserIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProfileDropdown() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getUserAvatar = (user: User) => {
    // Check if user has a custom avatar
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    // Use default avatar for all users
    return "/default-avatar.jpg"
  }

  if (loading) {
    return <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
  }

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button
          variant="outline"
          size="sm"
          className="border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
        >
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
    <button
      type="button"
      className="relative h-8 w-8 rounded-full focus:outline-none"
    >
      <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
        <AvatarImage src={getUserAvatar(user) || "/placeholder.svg"} alt={user.email || ""} />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {user.email ? getInitials(user.email) : <UserIcon className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
    </button>
  </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user.email}</p>
            <p className="text-xs text-muted-foreground">{user.user_metadata?.full_name || "CircuitBhai Member"}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/community" className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            Community
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
