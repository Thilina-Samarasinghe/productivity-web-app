"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task } from "@/app/dashboard/page"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, subDays } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

type TaskStats = {
  totalTasks: number
  completedTasks: number
  highPriorityCompleted: number
  mediumPriorityCompleted: number
  lowPriorityCompleted: number
  completionRate: number
  dailyCompletions: { date: string; count: number }[]
  priorityDistribution: { name: string; value: number }[]
}

export default function ProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    highPriorityCompleted: 0,
    mediumPriorityCompleted: 0,
    lowPriorityCompleted: 0,
    completionRate: 0,
    dailyCompletions: [],
    priorityDistribution: [],
  })
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    if (user && supabase) {
      fetchTasks()
    } else if (!supabase) {
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the database. Please check your configuration.",
      })
    }
  }, [user, supabase])

  useEffect(() => {
    if (tasks.length > 0) {
      calculateStats()
    }
  }, [tasks])

  const fetchTasks = async () => {
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
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const completedTasks = tasks.filter((task) => task.status === "completed")
    const highPriorityCompleted = completedTasks.filter((task) => task.priority === "high").length
    const mediumPriorityCompleted = completedTasks.filter((task) => task.priority === "medium").length
    const lowPriorityCompleted = completedTasks.filter((task) => task.priority === "low").length

    // Calculate daily completions for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      return format(date, "yyyy-MM-dd")
    }).reverse()

    const dailyCompletions = last7Days.map((date) => {
      const count = completedTasks.filter((task) => {
        const taskDate = new Date(task.created_at)
        return format(taskDate, "yyyy-MM-dd") === date
      }).length

      return {
        date: format(new Date(date), "MMM dd"),
        count,
      }
    })

    // Calculate priority distribution
    const priorityDistribution = [
      { name: "High", value: tasks.filter((task) => task.priority === "high").length },
      { name: "Medium", value: tasks.filter((task) => task.priority === "medium").length },
      { name: "Low", value: tasks.filter((task) => task.priority === "low").length },
    ]

    setStats({
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      highPriorityCompleted,
      mediumPriorityCompleted,
      lowPriorityCompleted,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      dailyCompletions,
      priorityDistribution,
    })
  }

  const COLORS = ["#ef4444", "#f59e0b", "#6b7280"]

  const getMotivationalMessage = () => {
    const completionRate = stats.completionRate

    if (completionRate >= 80) {
      return "Outstanding work! You're crushing your tasks and making incredible progress."
    } else if (completionRate >= 60) {
      return "Great job! You're making solid progress on your tasks."
    } else if (completionRate >= 40) {
      return "You're making good progress. Keep up the momentum!"
    } else if (completionRate >= 20) {
      return "You're on your way. Each completed task is a step forward!"
    } else {
      return "Every journey begins with a single step. You've got this!"
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No tasks yet. Start adding tasks to track your progress.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highPriorityCompleted}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily Completions</TabsTrigger>
              <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Task Completions</CardTitle>
                  <CardDescription>Number of tasks completed each day over the past week</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.dailyCompletions}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" name="Tasks Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="priority" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Priority Distribution</CardTitle>
                  <CardDescription>Breakdown of tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.priorityDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.priorityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{getMotivationalMessage()}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
