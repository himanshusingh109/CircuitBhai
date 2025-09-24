import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // For now, allow all requests to pass through
  // This removes the SSR dependency that was causing import errors
  return NextResponse.next({
    request,
  })
}
