/**
 * Todo App Component
 *
 * Main todo list interface with real-time updates via Convex.
 * Features:
 * - Create new tasks
 * - Mark tasks as complete/incomplete
 * - Delete tasks
 * - Filter by status (all/active/completed)
 * - Real-time synchronization
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  useToast,
} from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/components";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type TabValue = "all" | "active" | "completed";

export function TodoApp() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const { toast } = useToast();

  // Queries
  const allTasks = useQuery(api.endpoints.tasks.list);
  const activeTasks = useQuery(api.endpoints.tasks.listByStatus, {
    status: "active",
  });
  const completedTasks = useQuery(api.endpoints.tasks.listByStatus, {
    status: "completed",
  });
  const summary = useQuery(api.endpoints.dashboard.summary);

  // Mutations
  const createTask = useMutation(api.endpoints.tasks.create);
  const toggleTask = useMutation(api.endpoints.tasks.toggleStatus);
  const deleteTask = useMutation(api.endpoints.tasks.remove);

  // Get tasks based on active tab
  const displayTasks =
    activeTab === "all"
      ? allTasks
      : activeTab === "active"
      ? activeTasks
      : completedTasks;

  // Handle create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle("");
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    }
  };

  // Handle toggle task status
  const handleToggleTask = async (taskId: Id<"tasks">) => {
    try {
      await toggleTask({ id: taskId });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ id: taskId });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Loading state
  const isLoading = displayTasks === undefined;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      {/* Header with Stats */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Simple Todo</h1>
        <p className="text-muted-foreground">
          Organize your tasks with ease. Real-time updates powered by Convex.
        </p>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {summary.activeTasks}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {summary.completedTasks}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Create Task Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All
                {allTasks && (
                  <Badge variant="secondary" className="ml-2">
                    {allTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {activeTasks && (
                  <Badge variant="default" className="ml-2">
                    {activeTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedTasks && (
                  <Badge variant="success" className="ml-2">
                    {completedTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-2 mt-4">
              {isLoading ? (
                // Loading skeletons
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : displayTasks && displayTasks.length > 0 ? (
                // Task list
                <div className="space-y-2">
                  {displayTasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleToggleTask(task._id)}
                        className="mt-0.5"
                      />

                      <div className="flex-1 space-y-1">
                        <p
                          className={`font-medium ${
                            task.status === "completed"
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.status === "completed" ? (
                            <Badge variant="success" size="sm">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              <Circle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          <span>
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                // Empty state
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Circle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No tasks found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "all"
                      ? "Create your first task to get started"
                      : activeTab === "active"
                      ? "No active tasks - you're all caught up!"
                      : "No completed tasks yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
