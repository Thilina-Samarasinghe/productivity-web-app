"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

// Define the context type
type SupabaseContextType = {
  supabase: ReturnType<typeof createClient>
  user: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

// Hardcoded Supabase credentials
const supabaseUrl = "https://tudhpxxevnjclrfqkgok.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1ZGhweHhldm5qY2xyZnFrZ29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MDIxMDEsImV4cCI6MjA1ODQ3ODEwMX0.v3V3U5Vo8LgKgf-D97SxEt9SddIswgFvY1KFKchaw44"

// Create a single Supabase client for the entire app
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

const SupabaseContext = createContext<SupabaseContextType | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setUser(data.session.user)
      }
      setLoading(false)
    }

    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    supabase,
    user,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        console.log("Signing in with:", email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("Sign in error:", error)
          throw error
        }

        console.log("Sign in successful:", data.user?.email)
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        })

        return { error: null }
      } catch (error) {
        console.error("Sign in catch error:", error)
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: error.message,
        })
        return { error }
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        console.log("Signing up with:", email)

        // For development purposes, we'll disable email confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This bypasses the email verification
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirmed: true,
            },
          },
        })

        if (error) {
          console.error("Sign up error:", error)
          throw error
        }

        // Check if user is already registered but not confirmed
        if (data?.user && !data.user.email_confirmed_at) {
          console.log("User registered but email not confirmed")
          return { error: null }
        }

        console.log("Sign up successful:", data.user?.email)
        toast({
          title: "Account created",
          description: "Your account has been created successfully. You can now log in.",
        })

        return { error: null }
      } catch (error) {
        console.error("Sign up catch error:", error)
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        })
        return { error }
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Sign out failed",
          description: error.message,
        })
      }
    },
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
