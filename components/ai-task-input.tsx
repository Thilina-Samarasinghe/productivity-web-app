"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import type { Task } from "@/app/dashboard/page"
import { useToast } from "@/components/ui/use-toast"

interface AITaskInputProps {
  onTaskCreated: (task: Omit<Task, "id" | "created_at" | "user_id">) => void
  onCancel: () => void
}

export function AITaskInput({ onTaskCreated, onCancel }: AITaskInputProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<Partial<Task> | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    setLoading(true)

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Parse the input with a simple rule-based approach
      // In a real app, this would be done with an AI model API call
      const parsedTask = parseTaskInput(input)
      setAiSuggestion(parsedTask)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error processing task",
        description: "There was an error processing your task with AI.",
      })
    } finally {
      setLoading(false)
    }
  }

  const parseTaskInput = (text: string): Partial<Task> => {
    // Simple rule-based parsing (in a real app, this would be AI-powered)
    const lowercaseText = text.toLowerCase()

    // Determine priority
    let priority: "high" | "medium" | "low" = "medium"
    if (lowercaseText.includes("urgent") || lowercaseText.includes("asap") || lowercaseText.includes("important")) {
      priority = "high"
    } else if (lowercaseText.includes("when possible") || lowercaseText.includes("low priority")) {
      priority = "low"
    }

    // Extract due date (very simple approach)
    let dueDate: string | undefined = undefined
    if (lowercaseText.includes("by tomorrow")) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dueDate = tomorrow.toISOString()
    } else if (lowercaseText.includes("by next week")) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      dueDate = nextWeek.toISOString()
    } else if (lowercaseText.includes("by friday")) {
      const today = new Date()
      const friday = new Date()
      friday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7))
      dueDate = friday.toISOString()
    }

    // Extract title and description
    let title = text
    let description = ""

    if (text.includes(":")) {
      const parts = text.split(":")
      title = parts[0].trim()
      description = parts.slice(1).join(":").trim()
    }

    return {
      title,
      description,
      priority,
      status: "todo",
      due_date: dueDate,
    }
  }

  const handleAccept = () => {
    if (aiSuggestion) {
      console.log("Accepting AI suggestion:", aiSuggestion)
      onTaskCreated({
        title: aiSuggestion.title || "",
        description: aiSuggestion.description || "",
        priority: aiSuggestion.priority || "medium",
        status: "todo",
        due_date: aiSuggestion.due_date,
      })
    }
  }

  return (
    <div className="space-y-4">
      {!aiSuggestion ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your task in natural language. For example: 'Prepare presentation for the marketing meeting by Friday'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={loading}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!input.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Process with AI
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-medium mb-2">AI Task Suggestion</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Title:</span>
                <p>{aiSuggestion.title}</p>
              </div>

              {aiSuggestion.description && (
                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground">{aiSuggestion.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <span className="text-sm font-medium">Priority:</span>
                  <p className="text-sm">
                    {aiSuggestion.priority?.charAt(0).toUpperCase() + aiSuggestion.priority?.slice(1)}
                  </p>
                </div>

                {aiSuggestion.due_date && (
                  <div>
                    <span className="text-sm font-medium">Due Date:</span>
                    <p className="text-sm">{new Date(aiSuggestion.due_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAiSuggestion(null)}>
              Edit
            </Button>
            <Button onClick={handleAccept}>Accept and Create</Button>
          </div>
        </div>
      )}
    </div>
  )
}
