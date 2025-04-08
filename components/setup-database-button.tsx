"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SetupDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const setupDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/setup-database")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Database setup complete",
          description: "Your database has been set up successfully.",
        })
      } else {
        throw new Error(data.error || "Failed to set up database")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={setupDatabase} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Setting up database...
        </>
      ) : (
        "Setup Database"
      )}
    </Button>
  )
}
