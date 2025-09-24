import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const specialty = searchParams.get("specialty")

    const supabase = await createClient()

    let query = supabase
      .from("technicians")
      .select(`
        *,
        technician_services (*)
      `)
      .eq("status", "approved")
      .order("rating", { ascending: false })

    if (specialty) {
      query = query.contains("specialties", [specialty])
    }

    const { data: technicians, error } = await query

    if (error) {
      console.error("Error fetching technicians:", error)
      return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 500 })
    }

    // In a real implementation, you would calculate distances using lat/lng
    // For now, we'll return the technicians as-is
    return NextResponse.json({ technicians })
  } catch (error) {
    console.error("Technicians API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json()
    const supabase = await createClient()

    const { data: technician, error } = await supabase
      .from("technicians")
      .insert([
        {
          name: registrationData.name,
          email: registrationData.email,
          phone: registrationData.phone,
          business_address: registrationData.address,
          specialties: registrationData.specialties,
          experience_years: Number.parseInt(registrationData.experience) || 0,
          license_number: registrationData.licenseNumber,
          certifications: registrationData.certifications || [],
          description: registrationData.description,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error registering technician:", error)
      return NextResponse.json({ error: "Failed to register technician" }, { status: 500 })
    }

    return NextResponse.json({ technician, message: "Registration submitted successfully" })
  } catch (error) {
    console.error("Technician registration API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
