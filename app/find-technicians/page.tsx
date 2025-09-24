"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Star, Clock, UserPlus, Calendar, CheckCircle, AlertCircle, Upload, Shield } from "lucide-react"
import Link from "next/link"
import TechniciansMap from "@/components/technicians-map"

interface Technician {
  id: string
  name: string
  address: string
  rating: number
  totalReviews: number
  phone?: string
  specialties: string[]
  distance: string
  availability: string
  verified: boolean
  placeId?: string
  mapLink?: string
  geometry?: any // Include geometry data for map markers
}

interface BookingForm {
  name: string
  phone: string
  email: string
  issue: string
  deviceType: string
  preferredTime: string
}

interface TechnicianRegistration {
  name: string
  email: string
  phone: string
  address: string
  specialties: string[]
  experience: string
  licenseNumber: string
  certifications: string[]
  description: string
}

export default function FindTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState<string>("prompt")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    phone: "",
    email: "",
    issue: "",
    deviceType: "",
    preferredTime: "",
  })
  const [registrationForm, setRegistrationForm] = useState<TechnicianRegistration>({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialties: [],
    experience: "",
    licenseNumber: "",
    certifications: [],
    description: "",
  })
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false)
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)

  // Helper for distance (km) when API does not include it
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371 // km
    const dLat = toRad(b.lat - a.lat)
    const dLon = toRad(b.lng - a.lng)
    const lat1 = toRad(a.lat)
    const lat2 = toRad(b.lat)
    const aa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
    return R * c
  }

  const requestLocation = async () => {
    setLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setUserLocation(location)
      setLocationPermission("granted")

      console.log("[v0] User location obtained:", location)

      // Call Google Places API through our backend
      const response = await fetch(`/api/getTechnicians?lat=${location.lat}&lng=${location.lng}`)
      const data = await response.json()

      console.log("[v0] API response:", data)

      if (data.results) {
        const transformedTechnicians: Technician[] = data.results.map((result: any, index: number) => {
          // Prefer distance from API; otherwise compute using geometry vs user location
          let distLabel = "Nearby"
          if (typeof result?.distance_km === "number") {
            distLabel = `${result.distance_km.toFixed(1)} km`
          } else if (result?.geometry?.location && location) {
            const km = distanceKm(location, { lat: result.geometry.location.lat, lng: result.geometry.location.lng })
            distLabel = `${km.toFixed(1)} km`
          }

          return {
            id: result.place_id || `tech-${index}`,
            name: result.name,
            address: result.vicinity || result.formatted_address || "Address not available",
            rating: result.rating || 4.0,
            totalReviews: result.user_ratings_total || 0,
            specialties: ["Electronics Repair", "Mobile Devices"],
            distance: distLabel, // Set distance label
            availability: "Contact for availability",
            verified: (result.rating || 0) >= 4.0,
            placeId: result.place_id,
            mapLink: result.place_id ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}` : undefined,
            geometry: result.geometry,
          }
        })

        setTechnicians(transformedTechnicians)
      } else {
        setTechnicians([])
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Location access denied or API error:", error)
      setLocationPermission("denied")
      setLoading(false)

      // Show fallback message but don't show mock data
      setTechnicians([])
    }
  }

  const handleBooking = async (technician: Technician) => {
    setSelectedTechnician(technician)
    setShowBookingDialog(true)
  }

  const submitBooking = async () => {
    if (!selectedTechnician || isSubmittingBooking) return

    setIsSubmittingBooking(true)

    try {
      const bookingData = {
        name: bookingForm.name,
        phone: bookingForm.phone,
        email: bookingForm.email,
        technicianId: selectedTechnician.id,
        technicianName: selectedTechnician.name,
        deviceType: bookingForm.deviceType,
        issue: bookingForm.issue,
        preferredTime: bookingForm.preferredTime,
      }

      console.log("[v0] Submitting booking:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || "Unknown error"}`)
      }

      const result = await response.json()
      console.log("[v0] Booking saved successfully:", result)

      // Reset form and close dialog
      setBookingForm({
        name: "",
        phone: "",
        email: "",
        issue: "",
        deviceType: "",
        preferredTime: "",
      })
      setShowBookingDialog(false)
      setSelectedTechnician(null)

      // Show success message
      alert("Booking request submitted successfully! The technician will contact you soon.")
    } catch (error) {
      console.error("[v0] Booking failed:", error)
      alert(`Failed to submit booking: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`)
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  const submitTechnicianRegistration = async () => {
    try {
      // Simulate API call to register technician
      const registrationData = {
        ...registrationForm,
        status: "pending_verification",
        createdAt: new Date().toISOString(),
      }

      console.log("Technician registration submitted:", registrationData)

      // Reset form and close dialog
      setRegistrationForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        specialties: [],
        experience: "",
        licenseNumber: "",
        certifications: [],
        description: "",
      })
      setShowRegistrationDialog(false)

      // Show success message
      alert(
        "Registration submitted successfully! We'll review your application and contact you within 2-3 business days.",
      )
    } catch (error) {
      console.error("Registration failed:", error)
      alert("Failed to submit registration. Please try again.")
    }
  }

  const addSpecialty = (specialty: string) => {
    if (specialty && !registrationForm.specialties.includes(specialty)) {
      setRegistrationForm({
        ...registrationForm,
        specialties: [...registrationForm.specialties, specialty],
      })
    }
  }

  const removeSpecialty = (specialty: string) => {
    setRegistrationForm({
      ...registrationForm,
      specialties: registrationForm.specialties.filter((s) => s !== specialty),
    })
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                  alt="CircuitBhai Logo"
                  className="w-50 h-50 object-contain bg-transparent"
                />
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/my-requests">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Clock className="w-4 h-4" />
                    My Requests
                  </Button>
                </Link>
                <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <UserPlus className="w-4 h-4" />
                      Register as Technician
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Register as a Verified Technician
                      </DialogTitle>
                      <DialogDescription>
                        Join our network of trusted repair professionals. All applications are reviewed for quality and
                        credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-name">Full Name *</Label>
                          <Input
                            id="reg-name"
                            value={registrationForm.name}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reg-email">Email *</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            value={registrationForm.email}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-phone">Phone Number *</Label>
                          <Input
                            id="reg-phone"
                            value={registrationForm.phone}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reg-experience">Years of Experience *</Label>
                          <Input
                            id="reg-experience"
                            value={registrationForm.experience}
                            onChange={(e) => setRegistrationForm({ ...registrationForm, experience: e.target.value })}
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reg-address">Business Address *</Label>
                        <Input
                          id="reg-address"
                          value={registrationForm.address}
                          onChange={(e) => setRegistrationForm({ ...registrationForm, address: e.target.value })}
                          placeholder="123 Main St, City, State 12345"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reg-license">License/Certification Number *</Label>
                        <Input
                          id="reg-license"
                          value={registrationForm.licenseNumber}
                          onChange={(e) => setRegistrationForm({ ...registrationForm, licenseNumber: e.target.value })}
                          placeholder="Enter your professional license or certification number"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Required for verification. This could be a business license, electronics repair certification,
                          or relevant trade license.
                        </p>
                      </div>

                      <div>
                        <Label>Specialties *</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {registrationForm.specialties.map((specialty) => (
                            <Badge
                              key={specialty}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeSpecialty(specialty)}
                            >
                              {specialty} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            "Smartphones",
                            "Tablets",
                            "Laptops",
                            "Desktop PCs",
                            "Gaming Consoles",
                            "Audio Equipment",
                          ].map((specialty) => (
                            <Button
                              key={specialty}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addSpecialty(specialty)}
                              disabled={registrationForm.specialties.includes(specialty)}
                            >
                              {specialty}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reg-description">Business Description</Label>
                        <Textarea
                          id="reg-description"
                          value={registrationForm.description}
                          onChange={(e) => setRegistrationForm({ ...registrationForm, description: e.target.value })}
                          placeholder="Tell customers about your repair services, experience, and what makes you unique..."
                          rows={3}
                        />
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Required Documents
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          After submitting this form, you'll need to upload:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Copy of business license or professional certification</li>
                          <li>• Proof of insurance (if applicable)</li>
                          <li>• Photo ID</li>
                          <li>• Portfolio of previous work (optional but recommended)</li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={submitTechnicianRegistration} className="flex-1">
                          Submit Application
                        </Button>
                        <Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Nearby Repair Technicians</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find trusted, verified repair professionals in your area. Get your devices fixed by experts.
            </p>
          </div>

          {/* Location Request */}
          {locationPermission === "prompt" && (
            <Card className="mb-8 border-primary/20">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Find Technicians Near You</h3>
                <p className="text-muted-foreground mb-4">
                  Allow location access to find the closest repair technicians in your area.
                </p>
                <Button onClick={requestLocation} disabled={loading} className="flex items-center gap-2 mx-auto">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Finding Technicians...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Allow Location Access
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Location Denied Message */}
          {locationPermission === "denied" && (
            <Card className="mb-8 border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Location access denied. Please enable location access and refresh to find nearby technicians.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Technicians List with Map */}
          {technicians.length > 0 && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Available Technicians ({technicians.length})</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Found via Google Places
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Locations Map */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Locations Map</h3>
                  <TechniciansMap
                    technicians={technicians}
                    userLocation={userLocation}
                    onTechnicianSelect={setSelectedTechnician}
                    selectedTechnician={selectedTechnician}
                  />
                </div>

                {/* Right: Technician Details - scrollable list */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Technician Details</h3>
                  <div className="rounded-2xl border bg-card shadow-sm p-2 max-h-[520px] overflow-y-auto">
                    <div className="grid gap-4">
                      {technicians.map((technician) => (
                        <Card
                          key={technician.id}
                          className={`rounded-2xl border-2 bg-muted/40 hover:border-primary/30 shadow-sm transition-colors cursor-pointer ${
                            selectedTechnician?.id === technician.id ? "border-primary/50 bg-primary/5" : ""
                          }`}
                          onClick={() => setSelectedTechnician(technician)}
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-xl font-semibold text-foreground">{technician.name}</h4>
                                    {technician.verified && (
                                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{technician.address}</span>
                                    {/* Show distance like the reference */}
                                    {technician.distance && (
                                      <span className="before:content-['•'] before:mx-2">{technician.distance}</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium">{technician.rating}</span>
                                      <span className="text-muted-foreground">({technician.totalReviews} reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="w-4 h-4" />
                                      <span>{technician.availability}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleBooking(technician)
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Book
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="bg-transparent"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={
                                        technician.mapLink ||
                                        `https://maps.google.com/?q=${encodeURIComponent(technician.address)}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <MapPin className="w-4 h-4 mr-2" />
                                      Maps
                                    </a>
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {technician.specialties.map((specialty) => (
                                  <Badge key={specialty} variant="outline">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No Results Message */}
          {locationPermission === "granted" && !loading && technicians.length === 0 && (
            <Card className="mb-8 border-muted">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">No Technicians Found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any repair technicians in your immediate area. Try expanding your search radius or
                  check back later.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Booking Dialog */}
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Book Repair Service</DialogTitle>
                <DialogDescription>
                  {selectedTechnician && `Book a repair with ${selectedTechnician.name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Your Name *</Label>
                  <Input
                    id="customer-name"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={isSubmittingBooking}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-phone">Phone *</Label>
                    <Input
                      id="customer-phone"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      disabled={isSubmittingBooking}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="john@example.com"
                      disabled={isSubmittingBooking}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="device-type">Device Type *</Label>
                  <Input
                    id="device-type"
                    value={bookingForm.deviceType}
                    onChange={(e) => setBookingForm({ ...bookingForm, deviceType: e.target.value })}
                    placeholder="iPhone 13, Samsung Galaxy S23, etc."
                    disabled={isSubmittingBooking}
                  />
                </div>

                <div>
                  <Label htmlFor="issue-description">Issue Description *</Label>
                  <Textarea
                    id="issue-description"
                    value={bookingForm.issue}
                    onChange={(e) => setBookingForm({ ...bookingForm, issue: e.target.value })}
                    placeholder="Describe the problem with your device..."
                    rows={3}
                    disabled={isSubmittingBooking}
                  />
                </div>

                <div>
                  <Label htmlFor="preferred-time">Preferred Time</Label>
                  <Input
                    id="preferred-time"
                    value={bookingForm.preferredTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                    placeholder="Today afternoon, Tomorrow morning, etc."
                    disabled={isSubmittingBooking}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={submitBooking}
                    className="flex-1"
                    disabled={
                      isSubmittingBooking ||
                      !bookingForm.name ||
                      !bookingForm.phone ||
                      !bookingForm.deviceType ||
                      !bookingForm.issue
                    }
                  >
                    {isSubmittingBooking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Booking Request"
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowBookingDialog(false)} disabled={isSubmittingBooking}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}
