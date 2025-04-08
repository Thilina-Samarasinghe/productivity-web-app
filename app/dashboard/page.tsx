"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { AITaskInput } from "@/components/ai-task-input"
import { Loader2, Plus, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Task type definition
export type Task = {
  id: string
  title: string
  description?: string
  priority: "high" | "medium" | "low"
  status: "todo" | "in-progress" | "completed"
  created_at: string
  due_date?: string
  user_id: string
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showAIInput, setShowAIInput] = useState(false)
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      console.log("Fetching tasks for user:", user.id)

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        throw error
      }

      console.log("Tasks fetched:", data?.length || 0)
      setTasks(data || [])
    } catch (error) {
      console.error("Error in fetchTasks:", error)
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (task: Omit<Task, "id" | "created_at" | "user_id">) => {
    try {
      console.log("Adding task:", task)
      console.log("User ID:", user.id)

      const newTask = {
        ...task,
        user_id: user.id,
      }

      console.log("New task with user_id:", newTask)

      const { data, error } = await supabase.from("tasks").insert([newTask]).select()

      if (error) {
        console.error("Error inserting task:", error)
        throw error
      }

      console.log("Task added successfully:", data)

      if (data && data.length > 0) {
        setTasks([data[0], ...tasks])
        setShowTaskForm(false)
        setShowAIInput(false)

        toast({
          title: "Task added",
          description: "Your task has been added successfully.",
        })
      } else {
        throw new Error("No data returned from insert operation")
      }
    } catch (error) {
      console.error("Error in addTask:", error)
      toast({
        variant: "destructive",
        title: "Error adding task",
        description: error.message,
      })
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log("Updating task:", id, updates)

      const { error } = await supabase.from("tasks").update(updates).eq("id", id)

      if (error) {
        console.error("Error updating task:", error)
        throw error
      }

      console.log("Task updated successfully")
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })
    } catch (error) {
      console.error("Error in updateTask:", error)
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      })
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log("Deleting task:", id)

      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        console.error("Error deleting task:", error)
        throw error
      }

      console.log("Task deleted successfully")
      setTasks(tasks.filter((task) => task.id !== id))

      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error in deleteTask:", error)
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message,
      })
    }
  }

  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && task.status !== "completed")
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium" && task.status !== "completed")
  const lowPriorityTasks = tasks.filter((task) => task.priority === "low" && task.status !== "completed")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setShowTaskForm(true)
              setShowAIInput(false)
            }}
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> Add Task
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowAIInput(true)
              setShowTaskForm(false)
            }}
            className="gap-1"
          >
            <Brain className="h-4 w-4" /> AI Input
          </Button>
        </div>
      </div>

      {showTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new task to track your work</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskForm onSubmit={addTask} onCancel={() => setShowTaskForm(false)} />
          </CardContent>
        </Card>
      )}

      {showAIInput && (
        <Card>
          <CardHeader>
            <CardTitle>AI Task Input</CardTitle>
            <CardDescription>Describe your task in natural language and let AI parse it</CardDescription>
          </CardHeader>
          <CardContent>
            <AITaskInput onTaskCreated={addTask} onCancel={() => setShowAIInput(false)} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="high">
            High Priority
            {highPriorityTasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {highPriorityTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="medium">Medium Priority</TabsTrigger>
          <TabsTrigger value="low">Low Priority</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No tasks yet. Create your first task to get started.</p>
              <Button onClick={() => setShowTaskForm(true)} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Your First Task
              </Button>
            </div>
          ) : (
            <TaskList
              tasks={tasks.filter((task) => task.status !== "completed")}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          )}
        </TabsContent>

        <TabsContent value="high" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : highPriorityTasks.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No high priority tasks.</p>
          ) : (
            <TaskList tasks={highPriorityTasks} onUpdate={updateTask} onDelete={deleteTask} />
          )}
        </TabsContent>

        <TabsContent value="medium" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : mediumPriorityTasks.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No medium priority tasks.</p>
          ) : (
            <TaskList tasks={mediumPriorityTasks} onUpdate={updateTask} onDelete={deleteTask} />
          )}
        </TabsContent>

        <TabsContent value="low" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : lowPriorityTasks.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No low priority tasks.</p>
          ) : (
            <TaskList tasks={lowPriorityTasks} onUpdate={updateTask} onDelete={deleteTask} />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : completedTasks.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No completed tasks.</p>
          ) : (
            <TaskList tasks={completedTasks} onUpdate={updateTask} onDelete={deleteTask} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
