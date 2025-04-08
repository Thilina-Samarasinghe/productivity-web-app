import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Hardcoded Supabase credentials
const supabaseUrl = "https://tudhpxxevnjclrfqkgok.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZGhweHhldm5qY2xyZnFrZ29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDIxMDEsImV4cCI6MjA1ODQ3ODEwMX0.v3V3U5Vo8LgKgf-D97SxEt9SddIswgFvY1KFKchaw44"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}
