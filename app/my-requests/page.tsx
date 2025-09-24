"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  CheckCircle,
  Package,
  CreditCard,
  Smartphone,
  Laptop,
  Headphones,
  Wrench,
  MapPin,
  Calendar,
  User,
  Menu,
  ArrowLeft,
  MessageCircle,
  Users,
  Recycle,
  Trophy,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  device_type: string
  issue_description: string
  preferred_time: string
  status: string
  booking_date: string
  external_technician_name?: string
  external_technician_id?: string
  created_at: string
  updated_at: string
}

const stages = [
  { id: 1, name: "Request Booked", description: "Repair request submitted", icon: Clock },
  { id: 2, name: "Request Verified", description: "Shop confirmed availability & cost", icon: CheckCircle },
  { id: 3, name: "Device Delivered", description: "Device handed over for repair", icon: Package },
  { id: 4, name: "Payment & Rewards", description: "Payment completed & ecoPoints earned", icon: CreditCard },
]

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case "smartphone":
    case "phone":
    case "mobile":
      return Smartphone
    case "laptop":
    case "computer":
      return Laptop
    case "headphones":
    case "earphones":
      return Headphones
    default:
      return Wrench
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-primary text-primary-foreground"
    case "verified":
    case "confirmed":
      return "bg-accent text-accent-foreground"
    case "pending":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStageFromStatus = (status: string): number => {
  switch (status.toLowerCase()) {
    case "pending":
      return 1
    case "verified":
    case "confirmed":
      return 2
    case "in_progress":
    case "delivered":
      return 3
    case "completed":
      return 4
    default:
      return 1
  }
}

export default function MyRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log("[v0] Fetching bookings from API...")
        const response = await fetch("/api/bookings")

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Bookings fetched successfully:", data)

        setBookings(data.bookings || [])
      } catch (err) {
        console.error("[v0] Error fetching bookings:", err)
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                alt="CircuitBhai Logo"
                className="w-20 h-20 object-contain bg-transparent"
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
                        href="/dashboard"
                        className="flex items-center gap-3 text-foreground hover:text-primary transition-colors font-medium py-2 px-3 rounded-lg hover:bg-muted"
                      >
                        <Trophy className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">My Repair Requests</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Track the progress of your device repairs and manage your requests all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Requests List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading your requests...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Error Loading Requests</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-8">
              {bookings.map((booking) => {
                const DeviceIcon = getDeviceIcon(booking.device_type)
                const currentStage = getStageFromStatus(booking.status)
                const progressPercentage = (currentStage / 4) * 100

                return (
                  <Card
                    key={booking.id}
                    className="border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
                            <DeviceIcon className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-foreground">{booking.device_type}</CardTitle>
                            <p className="text-muted-foreground">Request ID: {booking.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Request Details */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Issue Description</h4>
                            <p className="text-muted-foreground leading-relaxed">{booking.issue_description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{booking.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Requested on {new Date(booking.booking_date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {booking.external_technician_name && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Repair Shop</h4>
                              <p className="text-foreground font-medium">{booking.external_technician_name}</p>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Google Places Technician</span>
                              </div>
                            </div>
                          )}

                          {booking.preferred_time && (
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Preferred Time</h4>
                              <p className="text-muted-foreground capitalize">{booking.preferred_time}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Tracker */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Progress</h4>
                          <span className="text-sm text-muted-foreground">Stage {currentStage} of 4</span>
                        </div>

                        <Progress value={progressPercentage} className="h-2" />

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {stages.map((stage) => {
                            const StageIcon = stage.icon
                            const isCompleted = currentStage >= stage.id
                            const isCurrent = currentStage === stage.id

                            return (
                              <div
                                key={stage.id}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                  isCompleted
                                    ? "border-primary/30 bg-primary/5"
                                    : isCurrent
                                      ? "border-accent/30 bg-accent/5"
                                      : "border-border bg-muted/30"
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isCompleted
                                        ? "bg-primary text-primary-foreground"
                                        : isCurrent
                                          ? "bg-accent text-accent-foreground"
                                          : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <StageIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <h5
                                      className={`font-medium text-sm ${
                                        isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                                      }`}
                                    >
                                      {stage.name}
                                    </h5>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{stage.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                        {currentStage === 2 && (
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Package className="w-4 h-4 mr-2" />
                            Confirm Device Delivery
                          </Button>
                        )}
                        {currentStage === 3 && (
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Make Payment
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="border-border text-foreground hover:bg-muted bg-transparent"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Shop
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Wrench className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No Repair Requests Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start your repair journey by finding expert technicians for your devices.
              </p>
              <Link href="/find-technicians">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Wrench className="w-4 h-4 mr-2" />
                  Find Experts
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
