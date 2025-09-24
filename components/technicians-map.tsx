"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"

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
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface TechniciansMapProps {
  technicians: Technician[]
  userLocation: { lat: number; lng: number } | null
  onTechnicianSelect?: (technician: Technician) => void
  selectedTechnician?: Technician | null
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function TechniciansMap({
  technicians,
  userLocation,
  onTechnicianSelect,
  selectedTechnician,
}: TechniciansMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Array<{ id: string; marker: any }>>([])
  const infoWindowRef = useRef<any>(null)
  const circleRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle)
            initializeMap()
          }
        }, 100)
        return
      }

      // Load the Google Maps JavaScript API with demo key
      // Note: In production, this key should be restricted to specific domains in Google Cloud Console
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAADSz7yEndMlU9yzhC0-tqo1hHu8IOM2k&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      script.onerror = () => {
        setError("Failed to load Google Maps")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    try {
      const center = userLocation || { lat: 28.6139, lng: 77.209 } // Default to Delhi

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      mapInstanceRef.current = map

      // Draw 10km radius when we have user location
      if (userLocation) {
        if (circleRef.current) {
          circleRef.current.setMap(null)
        }
        circleRef.current = new window.google.maps.Circle({
          map,
          center: userLocation,
          radius: 10000, // 10km
          strokeColor: "#22c55e",
          strokeOpacity: 0.4,
          strokeWeight: 1,
          fillColor: "#22c55e",
          fillOpacity: 0.06,
        })
      }

      // Add user location marker if available
      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12),
          },
        })
      }

      setIsLoading(false)
    } catch (err) {
      console.error("[v0] Error initializing map:", err)
      setError("Failed to initialize map")
      setIsLoading(false)
    }
  }

  const buildInfoContent = (t: Technician) => `
    <div style="padding: 12px; max-width: 280px;">
      <h3 style="margin: 0 0 8px 0; font-weight: 700; color: #1f2937; font-size: 16px;">${t.name}</h3>
      <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">${t.address}</p>
      <div style="display:flex;align-items:center;gap:6px;margin:4px 0 8px 0;">
        <span style="color:#f59e0b;">★</span>
        <span style="font-weight:600;">${t.rating}</span>
        <span style="color:#6b7280; font-size: 13px;">(${t.totalReviews} reviews)</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${t.specialties.map((s) => `<span style="background:#f3f4f6;padding:4px 8px;border-radius:999px;font-size:12px;">${s}</span>`).join("")}
      </div>
    </div>
  `

  const openInfoWindowAtMarker = (marker: any, technician: Technician) => {
    if (!mapInstanceRef.current) return
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow()
    }
    infoWindowRef.current.setContent(buildInfoContent(technician))
    infoWindowRef.current.open(mapInstanceRef.current, marker)
  }

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(({ marker }) => marker.setMap(null))
    markersRef.current = []

    // Add technician markers
    technicians.forEach((technician, index) => {
      // Use geometry location if available, otherwise create a small offset around userLocation (fallback)
      let position = null as null | { lat: number; lng: number }

      if (technician.geometry?.location) {
        position = technician.geometry.location
      } else if (userLocation) {
        const angle = (index / Math.max(technicians.length, 1)) * 2 * Math.PI
        const radius = 0.01 // ~1km fallback
        position = {
          lat: userLocation.lat + Math.cos(angle) * radius,
          lng: userLocation.lng + Math.sin(angle) * radius,
        }
      }

      if (position) {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: technician.name,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C11.6 2 8 5.6 8 10C8 16 16 30 16 30S24 16 24 10C24 5.6 20.4 2 16 2Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="16" cy="10" r="4" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32),
          },
        })

        // Open info window + notify selection on marker click
        marker.addListener("click", () => {
          if (onTechnicianSelect) onTechnicianSelect(technician)
          openInfoWindowAtMarker(marker, technician)
        })

        markersRef.current.push({ id: technician.id, marker })
      }
    })

    // Adjust map bounds to show all markers within the 10km context
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      if (userLocation) bounds.extend(userLocation)
      markersRef.current.forEach(({ marker }) => bounds.extend(marker.getPosition()))
      mapInstanceRef.current.fitBounds(bounds)
      window.google.maps.event.addListenerOnce(mapInstanceRef.current, "bounds_changed", () => {
        if (mapInstanceRef.current.getZoom() > 15) {
          mapInstanceRef.current.setZoom(15)
        }
      })
    }
  }, [technicians, userLocation, onTechnicianSelect])

  useEffect(() => {
    if (!selectedTechnician || !mapInstanceRef.current) return
    const found = markersRef.current.find((m) => m.id === selectedTechnician.id)
    if (found) {
      const { marker } = found
      // Center map on selected marker and open info window
      mapInstanceRef.current.panTo(marker.getPosition())
      marker.setAnimation(window.google.maps.Animation.BOUNCE)
      setTimeout(() => marker.setAnimation(null), 1200)
      openInfoWindowAtMarker(marker, selectedTechnician)
    }
  }, [selectedTechnician, technicians])

  if (error) {
    return (
      <Card className="h-[360px] md:h-[520px] rounded-2xl shadow-sm">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Map Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[360px] md:h-[520px] rounded-2xl shadow-sm">
      <CardContent className="h-full p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p className="font-medium">Loading Map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full rounded-2xl" />
      </CardContent>
    </Card>
  )
}
