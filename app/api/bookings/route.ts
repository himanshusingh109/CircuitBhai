import { type NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Bookings API POST endpoint called")

  try {
    const bookingData = await request.json()
    console.log("[v0] Received booking data:", bookingData)

    const supabase = await createServiceRoleClient()
    console.log("[v0] Supabase service role client created")

    const insertData = {
      customer_name: bookingData.name,
      customer_phone: bookingData.phone,
      customer_email: bookingData.email,
      // Handle external technicians (Google Places)
      external_technician_id: bookingData.technicianId,
      external_technician_name: bookingData.technicianName,
      external_technician_source: "google_places",
      technician_id: null, // Set to null for external technicians
      device_type: bookingData.deviceType,
      issue_description: bookingData.issue,
      preferred_time: bookingData.preferredTime,
      status: "pending",
      booking_date: new Date().toISOString(),
      notes: bookingData.notes || null,
    }

    console.log("[v0] Inserting data:", insertData)

    const { data: booking, error } = await supabase.from("bookings").insert([insertData]).select().single()

    if (error) {
      console.error("[v0] Supabase error creating booking:", error)
      return NextResponse.json({ error: `Failed to create booking: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Booking created successfully:", booking)
    return NextResponse.json({ booking, message: "Booking created successfully" })
  } catch (error) {
    console.error("[v0] Booking API error:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("[v0] Bookings API GET endpoint called")

  try {
    const { searchParams } = new URL(request.url)
    const technicianId = searchParams.get("technicianId")
    console.log("[v0] Fetching bookings with technicianId:", technicianId)

    const supabase = await createServiceRoleClient()

    let query = supabase
      .from("bookings")
      .select(`
        *,
        technicians (name, phone)
      `)
      .order("created_at", { ascending: false })

    if (technicianId) {
      query = query.eq("technician_id", technicianId)
    }

    console.log("[v0] Executing database query...")
    const { data: bookings, error } = await query

    if (error) {
      console.error("[v0] Error fetching bookings:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    console.log("[v0] Bookings fetched successfully:", bookings?.length || 0, "records")
    console.log("[v0] Sample booking data:", bookings?.[0] || "No bookings found")

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("[v0] Bookings API GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
