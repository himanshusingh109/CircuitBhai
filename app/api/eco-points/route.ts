import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { deviceType, repairSessionId, amount, description } = await request.json()

    if (!deviceType || !amount || !description) {
      return NextResponse.json({ error: "Device type, amount, and description are required" }, { status: 400 })
    }

    console.log("[v0] Eco points API called with:", { deviceType, amount, description, repairSessionId })

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] User not authenticated:", userError)
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Ensure user profile exists (create if not exists)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (profileCheckError && profileCheckError.code === "PGRST116") {
      // Profile doesn't exist, create it
      console.log("[v0] Creating user profile for:", user.id)
      const { error: createProfileError } = await supabase.from("user_profiles").insert({
        id: user.id,
        eco_points: 0,
        total_repairs_completed: 0,
        level: 1,
        total_points: 0,
      })

      if (createProfileError) {
        console.error("[v0] Error creating user profile:", createProfileError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }
    }

    // Add eco points transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("eco_points_transactions")
      .insert({
        user_id: user.id,
        transaction_type: "earned",
        amount: amount,
        description: description,
        device_type: deviceType,
        repair_session_id: repairSessionId || `repair_${Date.now()}`,
      })
      .select()
      .single()

    if (transactionError) {
      console.error("[v0] Error creating eco points transaction:", transactionError)
      return NextResponse.json({ error: "Failed to award eco points" }, { status: 500 })
    }

    console.log("[v0] Eco points transaction created:", transaction)

    // Get updated user profile
    const { data: updatedProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error fetching updated profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch updated profile" }, { status: 500 })
    }

    console.log("[v0] Updated user profile:", updatedProfile)

    return NextResponse.json({
      success: true,
      transaction,
      profile: updatedProfile,
      message: `Successfully awarded ${amount} eco points!`,
    })
  } catch (error) {
    console.error("[v0] Eco points API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET eco-points API called")
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("[v0] User auth check:", { user: user?.id, error: userError })

    if (userError || !user) {
      console.log("[v0] User not authenticated:", userError)
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

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
        return NextResponse.json(
          {
            error: "Failed to create user profile",
            details: createError.message,
            code: createError.code,
          },
          { status: 500 },
        )
      }

      console.log("[v0] Created new profile:", newProfile)

      return NextResponse.json({
        profile: newProfile,
        transactions: [],
      })
    }

    if (profileError) {
      console.error("[v0] Error fetching user profile:", profileError)
      return NextResponse.json(
        {
          error: "Failed to fetch user profile",
          details: profileError.message,
          code: profileError.code,
        },
        { status: 500 },
      )
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
      // Still return profile data even if transactions fail
      return NextResponse.json({
        profile,
        transactions: [],
        warning: "Failed to fetch transaction history",
      })
    }

    console.log("[v0] Successfully fetched user data:", { profile, transactionCount: transactions?.length })

    return NextResponse.json({
      profile,
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("[v0] Eco points GET API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
