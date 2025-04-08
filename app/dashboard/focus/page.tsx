"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/app/dashboard/page"
import { Loader2, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function FocusPage() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId")

  useEffect(() => {
    if (user && supabase && taskId) {
      fetchTask(taskId)
    } else if (user && supabase) {
      fetchHighestPriorityTask()
    } else if (!supabase) {
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the database. Please check your configuration.",
      })
    }
  }, [user, taskId, supabase])

  const fetchTask = async (id: string) => {
    if (!supabase) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the database. Please check your configuration.",
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id).eq("user_id", user.id).single()

      if (error) throw error
      setTask(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching task",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHighestPriorityTask = async () => {
    if (!supabase) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the database. Please check your configuration.",
      })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // First try to get a high priority task
      let { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("priority", "high")
        .eq("status", "todo")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        // If no high priority task, try medium
        const mediumResult = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("priority", "medium")
          .eq("status", "todo")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (!mediumResult.error && mediumResult.data) {
          data = mediumResult.data
        } else {
          // If no medium priority task, try low
          const lowResult = await supabase
            .from("tasks")
            .select("*")
            .eq("user_id", user.id)
            .eq("priority", "low")
            .eq("status", "todo")
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (!lowResult.error && lowResult.data) {
            data = lowResult.data
          }
        }
      }

      setTask(data || null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: "Could not find any tasks to focus on.",
      })
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!)
          setIsRunning(false)
          toast({
            title: "Time's up!",
            description: "Your focus session is complete. Take a break!",
          })
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
  }

  const resetTimer = () => {
    pauseTimer()
    setTimeLeft(25 * 60)
  }

  const markTaskAsCompleted = async () => {
    if (!task) return

    try {
      const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", task.id)

      if (error) throw error

      setIsCompleted(true)
      pauseTimer()

      toast({
        title: "Task completed!",
        description: "Congratulations on completing your task.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      })
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-center">Focus Mode</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !task ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No tasks available to focus on.</p>
            <Button asChild>
              <a href="/dashboard">Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className={isCompleted ? "border-green-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
              </div>
              {task.description && <CardDescription className="text-base mt-2">{task.description}</CardDescription>}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
                <Progress value={(timeLeft / (25 * 60)) * 100} className="h-2" />
              </div>

              <div className="flex justify-center gap-4">
                {!isRunning ? (
                  <Button onClick={startTimer} disabled={isCompleted} className="gap-2">
                    <Play className="h-4 w-4" /> Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                )}

                <Button onClick={resetTimer} variant="outline" disabled={isCompleted} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>

                <Button onClick={markTaskAsCompleted} variant="default" disabled={isCompleted} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Complete Task
                </Button>
              </div>
            </CardContent>

            {isCompleted && (
              <CardFooter className="bg-green-50 dark:bg-green-950/20 py-4 text-center">
                <div className="w-full text-center text-green-600 dark:text-green-400">Task completed! Great job!</div>
              </CardFooter>
            )}
          </Card>

          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Focus Tips</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Remove distractions from your environment</li>
              <li>Focus on this single task until the timer ends</li>
              <li>Take a 5-minute break after each 25-minute session</li>
              <li>After 4 sessions, take a longer 15-30 minute break</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
