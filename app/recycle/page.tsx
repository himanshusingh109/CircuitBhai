"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Recycle, Leaf, Upload, Calendar, CheckCircle, Truck, Shield, Users } from "lucide-react"
import Link from "next/link"

interface PickupRequest {
  id: string
  name: string
  phone: string
  address: string
  itemType: string
  quantity: number
  pickupDateTime: string
  image?: string
}

export default function EWasteRecyclePage() {
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    itemType: "",
    quantity: "",
    pickupDateTime: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.itemType &&
      formData.quantity &&
      formData.pickupDateTime
    ) {
      const newRequest: PickupRequest = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        itemType: formData.itemType,
        quantity: Number.parseInt(formData.quantity),
        pickupDateTime: formData.pickupDateTime,
      }
      setPickupRequests([newRequest, ...pickupRequests])
      setFormData({
        name: "",
        phone: "",
        address: "",
        itemType: "",
        quantity: "",
        pickupDateTime: "",
      })
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 5000)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
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
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors">
                AI Repair Assistant
              </Link>
              <Link href="/find-technicians" className="text-muted-foreground hover:text-primary transition-colors">
                Find Technicians
              </Link>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">Recycle Your E-Waste</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Book a pickup and recycle responsibly.
          </p>
        </div>

        {showConfirmation && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <p className="font-medium">
                Thanks for scheduling your e-waste pickup! Our team will contact you shortly.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calendar className="w-5 h-5" />
                Schedule E-Waste Pickup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-green-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="border-green-300 focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-green-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-green-300 focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-green-700">
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Your pickup address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="border-green-300 focus:border-green-500 min-h-[80px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemType" className="text-green-700">
                    Item Type
                  </Label>
                  <Select
                    value={formData.itemType}
                    onValueChange={(value) => handleInputChange("itemType", value)}
                    required
                  >
                    <SelectTrigger className="border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Battery">Battery</SelectItem>
                      <SelectItem value="Charger">Charger</SelectItem>
                      <SelectItem value="TV">TV</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-green-700">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Number of items"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="border-green-300 focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupDateTime" className="text-green-700">
                    Preferred Pickup Date & Time
                  </Label>
                  <Input
                    id="pickupDateTime"
                    type="datetime-local"
                    value={formData.pickupDateTime}
                    onChange={(e) => handleInputChange("pickupDateTime", e.target.value)}
                    className="border-green-300 focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-green-700">
                    Upload Image (Optional)
                  </Label>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-green-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Schedule Pickup
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                <Recycle className="w-6 h-6 text-green-600" />
                How It Works
              </h2>

              <div className="grid gap-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">1. Book a pickup</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the form with your details and preferred pickup time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2. Team collects your e-waste</h3>
                    <p className="text-sm text-muted-foreground">
                      Our certified team will arrive at your location to collect the items.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3. Sent to verified recyclers</h3>
                    <p className="text-sm text-muted-foreground">
                      Your e-waste is processed by certified recycling facilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">4. You help reduce e-waste</h3>
                    <p className="text-sm text-muted-foreground">
                      Your contribution helps protect the environment and conserve resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Impact Stats */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Environmental Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2M+</div>
                    <div className="text-sm text-green-700">Tons E-waste Recycled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-sm text-green-700">Devices Processed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
