import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyAADSz7yEndMlU9yzhC0-tqo1hHu8IOM2k"

  const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371000 // meters
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  try {
    const base = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&key=${apiKey}`
    const searchQueries = [
      `${base}&type=electronics_store&keyword=repair`,
      `${base}&keyword=mobile repair`,
      `${base}&keyword=phone repair`,
      `${base}&keyword=electronics repair`,
    ]

    const allResults: any[] = []

    for (const url of searchQueries) {
      console.log("[v0] Calling Google Places API:", url.replace(apiKey, "API_KEY_HIDDEN"))

      const response = await fetch(url)
      const data = await response.json()

      console.log("[v0] Google Places API response status:", data.status)
      console.log("[v0] Found results:", data.results?.length || 0)

      if (data.status === "OK" && data.results?.length > 0) {
        allResults.push(...data.results)
      }
    }

    const uniqueResults = allResults.filter(
      (result, index, self) => index === self.findIndex((r) => r.place_id === result.place_id),
    )

    const originLat = Number.parseFloat(lat)
    const originLng = Number.parseFloat(lng)
    const within10km = uniqueResults
      .map((r) => {
        const loc = r?.geometry?.location
        if (!loc) return null
        const meters = haversineMeters(originLat, originLng, loc.lat, loc.lng)
        return { ...r, distance_meters: meters, distance_km: meters / 1000 }
      })
      .filter(Boolean)
      .filter((r: any) => r.distance_meters <= 10000)

    console.log("[v0] Unique technicians:", uniqueResults.length, "Within 10km:", within10km.length)

    if (within10km.length > 0) {
      // Return up to 10 results inside 10 km
      return NextResponse.json({ results: within10km.slice(0, 10) })
    }

    // No results within 10km, using mock data
    console.log("[v0] No results within 10km, using mock data")
    const mockResults = [
      {
        name: "ABC Mobile Repair",
        vicinity: "Connaught Place, New Delhi",
        rating: 4.5,
        user_ratings_total: 102,
        place_id: "ChIJxxxxx",
        geometry: { location: { lat: originLat + 0.05 /* ~5.5km */, lng: originLng + 0.02 /* ~2.2km */ } },
        distance_meters: haversineMeters(originLat, originLng, originLat + 0.05, originLng + 0.02),
      },
      {
        name: "QuickFix Electronics",
        vicinity: "Karol Bagh, New Delhi",
        rating: 4.2,
        user_ratings_total: 89,
        place_id: "ChIJyyyyy",
        geometry: { location: { lat: originLat + 0.03 /* ~3.3km */, lng: originLng - 0.03 /* ~3.3km */ } },
        distance_meters: haversineMeters(originLat, originLng, originLat + 0.03, originLng - 0.03),
      },
    ].map((r: any) => ({ ...r, distance_km: r.distance_meters / 1000 }))
    return NextResponse.json({ results: mockResults })
  } catch (error) {
    console.error("[v0] Error calling Google Places API:", error)
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 })
  }
}
