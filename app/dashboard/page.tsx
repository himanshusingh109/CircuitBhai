"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  ArrowLeft,
  Smartphone,
  Laptop,
  Wrench,
  Users,
  Gift,
  History,
  Coins,
  ShoppingCart,
  Percent,
  Calendar,
  Plus,
  Minus,
  Menu,
  MessageCircle,
  Recycle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [ecoPointsHistory, setEcoPointsHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const refreshData = async () => {
    try {
      setError(null)
      const supabase = createClient()

      console.log("[v0] Refreshing dashboard data...")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.log("[v0] User not authenticated during refresh")
        return
      }

      // Get updated user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      console.log("[v0] Profile refresh result:", { profile, error: profileError })

      if (!profileError && profile) {
        setUserProfile(profile)
      }

      // Get updated eco points transaction history
      const { data: transactions, error: transactionsError } = await supabase
        .from("eco_points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      console.log("[v0] Transactions refresh result:", { transactions, error: transactionsError })

      if (!transactionsError && transactions) {
        setEcoPointsHistory(transactions)
      }

      console.log("[v0] Dashboard data refreshed successfully")
    } catch (error) {
      console.error("[v0] Error refreshing dashboard data:", error)
    }
  }

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        console.log("[v0] Starting auth check...")

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        console.log("[v0] Auth check result:", {
          userId: user?.id,
          userEmail: user?.email,
          error: authError?.message,
          errorName: authError?.name,
        })

        if (authError || !user) {
          console.log("[v0] User not authenticated, showing login prompt")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        setIsAuthenticated(true)
        console.log("[v0] User authenticated, fetching user data...")

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        console.log("[v0] Profile fetch result:", { profile, error: profileError })

        // If profile doesn't exist, create it
        if (profileError && profileError.code === "PGRST116") {
          console.log("[v0] Creating new user profile for:", user.id)
          const { data: newProfile, error: createError } = await supabase
            .from("user_profiles")
            .insert({
              id: user.id,
              eco_points: 0,
              total_repairs_completed: 0,
              level: 1,
              total_points: 0,
            })
            .select()
            .single()

          if (createError) {
            console.error("[v0] Error creating user profile:", createError)
            throw new Error("Failed to create user profile")
          }

          console.log("[v0] Created new profile:", newProfile)
          setUserProfile(newProfile)
        } else if (profileError) {
          console.error("[v0] Error fetching user profile:", profileError)
          throw new Error("Failed to fetch user profile")
        } else {
          setUserProfile(profile)
        }

        // Get eco points transaction history
        const { data: transactions, error: transactionsError } = await supabase
          .from("eco_points_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        console.log("[v0] Transactions fetch result:", { transactions, error: transactionsError })

        if (transactionsError) {
          console.error("[v0] Error fetching transactions:", transactionsError)
          // Still continue even if transactions fail
          setEcoPointsHistory([])
        } else {
          setEcoPointsHistory(transactions || [])
        }

        console.log("[v0] Successfully fetched user data:", { profile, transactionCount: transactions?.length })

        console.log("[v0] Setting up real-time subscriptions...")

        // Subscribe to user profile changes
        const profileSubscription = supabase
          .channel("user_profile_changes")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_profiles",
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              console.log("[v0] Real-time profile update received:", payload.new)
              setUserProfile(payload.new)
            },
          )
          .subscribe()

        // Subscribe to eco points transaction changes
        const transactionSubscription = supabase
          .channel("eco_points_changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "eco_points_transactions",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              console.log("[v0] Real-time transaction update received:", payload.new)
              // Add new transaction to the beginning of the list
              setEcoPointsHistory((prev) => [payload.new, ...prev.slice(0, 19)])
              // Also refresh profile to get updated eco points balance
              refreshData()
            },
          )
          .subscribe()

        // Store subscriptions for cleanup
        return () => {
          console.log("[v0] Cleaning up real-time subscriptions...")
          profileSubscription.unsubscribe()
          transactionSubscription.unsubscribe()
        }
      } catch (error) {
        console.error("[v0] Error in checkAuthAndFetchData:", error)
        setError(error instanceof Error ? error.message : "Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    const cleanup = checkAuthAndFetchData()

    // Return cleanup function
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then((cleanupFn) => {
          if (typeof cleanupFn === "function") {
            cleanupFn()
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        console.log("[v0] Page became visible, refreshing data...")
        refreshData()
      }
    }

    const handleFocus = () => {
      if (isAuthenticated) {
        console.log("[v0] Window focused, refreshing data...")
        refreshData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [isAuthenticated])

  const userStats = {
    totalRepairs: userProfile?.total_repairs_completed || 0,
    points: userProfile?.total_points || 0,
    ecoPoints: userProfile?.eco_points || 0,
    level: userProfile?.level || 0,
    nextLevelPoints: (userProfile?.level || 3) * 1000,
    badges: [
      { id: 1, name: "First Repair", icon: "🔧", earned: (userProfile?.total_repairs_completed || 0) >= 1 },
      { id: 2, name: "Screen Master", icon: "📱", earned: (userProfile?.total_repairs_completed || 0) >= 3 },
      { id: 3, name: "Battery Expert", icon: "🔋", earned: (userProfile?.total_repairs_completed || 0) >= 5 },
      { id: 4, name: "Community Helper", icon: "🤝", earned: (userProfile?.total_repairs_completed || 0) >= 10 },
      { id: 5, name: "Laptop Guru", icon: "💻", earned: (userProfile?.total_repairs_completed || 0) >= 15 },
    ],
    recentRepairs: [
      { device: "iPhone 13 Pro", issue: "Cracked screen", status: "completed", date: "2025-09-25", ecoPoints: 50 },
      {
        device: "MacBook Air M2",
        issue: "Battery replacement",
        status: "in-progress",
        date: "2025-09-25",
        ecoPoints: 0,
      },
      { device: "Samsung Galaxy S23", issue: "Charging port", status: "completed", date: "2025-09-25", ecoPoints: 50 },
    ],
    weeklyGoal: { current: Math.min(userProfile?.total_repairs_completed || 3, 5), target: 5 },
    ecoPointsHistory: ecoPointsHistory.map((transaction, index) => ({
      id: transaction.id || index + 1,
      type: transaction.transaction_type || "earned",
      amount: transaction.amount || 0,
      description: transaction.description || "Repair completed",
      date: transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "2025-09-25",
      repairId: transaction.repair_session_id || `REQ-${String(index + 1).padStart(3, "0")}`,
    })),
    availableDiscounts: [
      {
        id: 1,
        title: "5% Off Next Repair",
        description: "Save 5% on your next repair service",
        cost: 500,
        type: "repair_discount",
        discount: 5,
      },
      {
        id: 2,
        title: "10% Off Premium Service",
        description: "Get 10% off premium repair services",
        cost: 1000,
        type: "premium_discount",
        discount: 10,
      },
      {
        id: 3,
        title: "Free Pickup Service",
        description: "Free device pickup and delivery",
        cost: 300,
        type: "free_service",
        discount: 0,
      },
      {
        id: 4,
        title: "Priority Support",
        description: "Get priority customer support for 30 days",
        cost: 800,
        type: "priority_support",
        discount: 0,
      },
      {
        id: 5,
        title: "15% Off Accessories",
        description: "Save on phone cases, chargers, and more",
        cost: 1200,
        type: "accessory_discount",
        discount: 15,
      },
    ],
    notifications: [
      {
        id: 1,
        type: "repair_update",
        title: "Repair Status Updated",
        message: "Your MacBook Air M2 repair is now in progress",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 2,
        type: "ecopoints_earned",
        title: "EcoPoints Earned!",
        message: `You earned ${ecoPointsHistory[0]?.amount || 450} EcoPoints for completing repair`,
        time: "1 day ago",
        read: false,
      },
      {
        id: 3,
        type: "discount_available",
        title: "New Discount Available",
        message: "You can now redeem 10% off your next repair",
        time: "2 days ago",
        read: true,
      },
      {
        id: 4,
        type: "repair_completed",
        title: "Repair Completed",
        message: "Your Samsung Galaxy S23 has been successfully repaired",
        time: "3 days ago",
        read: true,
      },
    ],
  }

  const levelProgress = ((userStats.points % 1000) / 1000) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="glass-effect sticky top-0 z-50 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </Link>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                  alt="CircuitBhai Logo"
                  className="w-50 h-50 object-contain bg-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Track Your Repair Journey</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sign in to access your personalized dashboard, track eco points, and monitor your environmental impact.
              </p>
            </div>

            {/* Preview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">Earn EcoPoints</div>
                  <div className="text-sm text-muted-foreground">
                    Get rewarded for every successful repair and contribute to sustainability
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">Level Up</div>
                  <div className="text-sm text-muted-foreground">
                    Progress through levels and unlock exclusive rewards and discounts
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">Track Progress</div>
                  <div className="text-sm text-muted-foreground">
                    Monitor your repair history and environmental impact over time
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample EcoPoints Earning */}
            <Card className="border-2 border-primary/20 max-w-2xl mx-auto mt-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="w-5 h-5 text-primary" />
                  How You Earn EcoPoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Smartphone Screen Repair</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">+450 EcoPoints</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Laptop Battery Replacement</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">+650 EcoPoints</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-primary" />
                      <span className="text-foreground">General Device Repair</span>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">+300 EcoPoints</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="space-y-4 mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Already have repairs in progress?{" "}
                <Link href="/chat" className="text-primary hover:underline">
                  Continue with AI Assistant
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 font-medium">{error}</div>
          {error.includes("Database tables") && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The database setup is incomplete. Please run the setup scripts from the project configuration.
              </p>
            </div>
          )}
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                alt="CircuitBhai Logo"
                className="w-50 h-50 object-contain bg-transparent"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                AI Assistant
              </Link>
              <Link
                href="/find-technicians"
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Find Experts
              </Link>
              <Link href="/recycle" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                E-Waste Pickup
              </Link>
              <ProfileDropdown />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4">
              <ProfileDropdown />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                        alt="CircuitBhai Logo"
                        className="w-16 h-16 object-contain bg-transparent"
                      />
                    </div>
                    <nav className="flex flex-col space-y-4">
                      <Link
                        href="/chat"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <MessageCircle className="w-5 h-5" />
                        AI Assistant
                      </Link>
                      <Link
                        href="/find-technicians"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Wrench className="w-5 h-5" />
                        Find Experts
                      </Link>
                      <Link
                        href="/recycle"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Recycle className="w-5 h-5" />
                        E-Waste Pickup
                      </Link>
                      <Link
                        href="/community"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Users className="w-5 h-5" />
                        Community
                      </Link>
                      <Link
                        href="/my-requests"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Trophy className="w-5 h-5" />
                        My Requests
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your repair progress, manage EcoPoints, and stay updated.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats.totalRepairs}</div>
              <div className="text-sm text-muted-foreground">Total Repairs</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{userStats.ecoPoints}</div>
              <div className="text-sm text-muted-foreground">EcoPoints</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">Level {userStats.level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ecopoints">EcoPoints</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Level Progress */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Level Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Level {userStats.level}</span>
                      <span className="text-sm text-muted-foreground">Level {userStats.level + 1}</span>
                    </div>
                    <Progress value={levelProgress} className="h-3" />
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {userStats.nextLevelPoints - userStats.points} points to next level
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Repairs */}
                <Card className="border-2 border-accent/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Clock className="w-5 h-5 text-accent" />
                        Recent Repairs
                      </CardTitle>
                      <Link href="/my-requests">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-accent/20 text-accent hover:bg-accent/5 bg-transparent"
                        >
                          View All
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userStats.recentRepairs.map((repair, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {repair.device.includes("iPhone") || repair.device.includes("Samsung") ? (
                                <Smartphone className="w-5 h-5 text-primary" />
                              ) : repair.device.includes("MacBook") ? (
                                <Laptop className="w-5 h-5 text-primary" />
                              ) : (
                                <Wrench className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{repair.device}</div>
                              <div className="text-sm text-muted-foreground">{repair.issue}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={repair.status === "completed" ? "default" : "secondary"}
                              className={
                                repair.status === "completed"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent/10 text-accent"
                              }
                            >
                              {repair.status === "completed" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {repair.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">{repair.date}</div>
                            {repair.ecoPoints > 0 && (
                              <div className="text-xs text-primary font-medium">+{repair.ecoPoints} EcoPoints</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly Goal */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Zap className="w-5 h-5 text-primary" />
                      Weekly Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{userStats.weeklyGoal.current}</div>
                      <div className="text-sm text-muted-foreground">of {userStats.weeklyGoal.target} repairs</div>
                    </div>
                    <Progress
                      value={(userStats.weeklyGoal.current / userStats.weeklyGoal.target) * 100}
                      className="h-2"
                    />
                    <div className="text-center">
                      <Link href="/find-technicians">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Start New Repair
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-2 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/chat">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                      >
                        <Zap className="w-4 h-4" />
                        Start AI Repair
                      </Button>
                    </Link>
                    <Link href="/my-requests">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-accent/20 text-accent hover:bg-accent/5 bg-transparent"
                      >
                        <Trophy className="w-4 h-4" />
                        My Requests
                      </Button>
                    </Link>
                    <Link href="/community">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                      >
                        <Users className="w-4 h-4" />
                        Join Community
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* EcoPoints Tab */}
          <TabsContent value="ecopoints" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <History className="w-5 h-5 text-primary" />
                      EcoPoints History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userStats.ecoPointsHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No eco points transactions yet.</p>
                          <p className="text-sm">Complete repairs to start earning eco points!</p>
                        </div>
                      ) : (
                        userStats.ecoPointsHistory.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  transaction.type === "earned" ? "bg-primary/10" : "bg-accent/10"
                                }`}
                              >
                                {transaction.type === "earned" ? (
                                  <Plus className="w-5 h-5 text-primary" />
                                ) : (
                                  <Minus className="w-5 h-5 text-accent" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{transaction.description}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {transaction.date}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-bold ${transaction.type === "earned" ? "text-primary" : "text-accent"}`}
                              >
                                {transaction.type === "earned" ? "+" : ""}
                                {transaction.amount}
                              </div>
                              <div className="text-xs text-muted-foreground">{transaction.repairId}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Coins className="w-5 h-5 text-primary" />
                      EcoPoints Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">{userStats.ecoPoints}</div>
                      <div className="text-sm text-muted-foreground">Available EcoPoints</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Earned:</span>
                        <span className="font-medium text-primary">
                          +
                          {userStats.ecoPointsHistory
                            .filter((t) => t.type === "earned")
                            .reduce((sum, t) => sum + t.amount, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Used:</span>
                        <span className="font-medium text-accent">
                          {userStats.ecoPointsHistory
                            .filter((t) => t.type === "used")
                            .reduce((sum, t) => sum + Math.abs(t.amount), 0)}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-foreground">Current Balance:</span>
                          <span className="text-primary">{userStats.ecoPoints}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Redeem Points
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-6">
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Gift className="w-5 h-5 text-accent" />
                  Available Discounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userStats.availableDiscounts.map((discount) => (
                    <Card
                      key={discount.id}
                      className="border border-border hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                              <Percent className="w-6 h-6 text-accent" />
                            </div>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {discount.cost} points
                            </Badge>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-2">{discount.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{discount.description}</p>
                          </div>

                          <Button
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                            disabled={userStats.ecoPoints < discount.cost}
                          >
                            {userStats.ecoPoints >= discount.cost ? "Redeem Now" : "Insufficient Points"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
