"use client"

import { motion } from "framer-motion"
import { Brain, Clock, LineChart, Focus } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Task Prioritization",
    description:
      "Our AI analyzes your tasks and intelligently prioritizes them based on urgency, importance, and your work patterns.",
  },
  {
    icon: Focus,
    title: "Distraction-Free Focus Mode",
    description: "Enter a clean, focused environment designed to help you concentrate on one task at a time.",
  },
  {
    icon: Clock,
    title: "Smart Time Management",
    description: "Track time spent on tasks and get AI-powered suggestions to improve your productivity.",
  },
  {
    icon: LineChart,
    title: "Progress Visualization",
    description: "See your productivity trends with beautiful charts and celebrate your achievements.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <div className="mx-auto mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Features that make you more productive
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          ThilinaK combines AI intelligence with proven productivity techniques
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
