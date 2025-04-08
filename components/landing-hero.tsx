"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export function LandingHero() {
  return (
    <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Focus on <span className="text-primary">one task</span> at a time
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
          ThilinaK uses AI to help you prioritize tasks, stay focused, and track your progress. The smart productivity
          app designed for the way you work.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mt-6"
      >
        <Link href="/auth/signup">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-12 w-full max-w-5xl rounded-lg border bg-background shadow-xl"
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="h-[300px] sm:h-[400px] rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center p-8 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold">AI-Powered Task Management</h3>
              <p className="mt-2 text-muted-foreground">Let AI help you prioritize and focus on what matters most</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
