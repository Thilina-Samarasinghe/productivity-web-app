"use client"

import { useState } from "react"
import type { Task } from "@/app/dashboard/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { MoreHorizontal, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

interface TaskListProps {
  tasks: Task[]
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onUpdate, onDelete }: TaskListProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)

  const handleStatusChange = (id: string, checked: boolean) => {
    onUpdate(id, {
      status: checked ? "completed" : "todo",
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      case "medium":
        return "bg-warning text-warning-foreground hover:bg-warning/90"
      case "low":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return format(new Date(dateString), "MMM d, yyyy")
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.status === "completed"}
                onCheckedChange={(checked) => handleStatusChange(task.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                      {task.due_date && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.due_date)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/dashboard/focus?taskId=${task.id}`}>
                        <DropdownMenuItem>Focus on this task</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => onUpdate(task.id, { priority: "high" })}>
                        Set as high priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdate(task.id, { priority: "medium" })}>
                        Set as medium priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdate(task.id, { priority: "low" })}>
                        Set as low priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTaskId(task.id)}>Delete task</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {task.description && (
                  <p className={`text-sm text-muted-foreground ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2 bg-muted/50 flex justify-end">
            <Link href={`/dashboard/focus?taskId=${task.id}`}>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                Focus on this task <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTaskId) {
                  onDelete(deleteTaskId)
                  setDeleteTaskId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
