import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, setHours, setMinutes, parse } from "date-fns"
import { CalendarIcon, Save, X } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { Priority, Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  parentId: z.string().optional(),
  completionDate: z.date().optional(),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

interface AddTaskDialogProps {
  children?: React.ReactNode
  task?: Task
  parentId?: string
  onTaskSave: (data: Omit<Task, "id" | "completed" | "createdAt"> & { dueTime?: string }) => void
  onTaskUpdate?: (data: Task) => void
  isEditing?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTaskDialog({ children, task, parentId, onTaskSave, onTaskUpdate, isEditing: isEditingProp, open: externalOpen, onOpenChange: externalOnOpenChange }: AddTaskDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Determine if the dialog's open state is controlled externally or internally
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  
  const isEditing = isEditingProp !== undefined ? isEditingProp : !!task;
  const title = isEditing ? "Edit Task" : parentId ? "Add Sub-task" : "Add Task";

  const defaultValues: Partial<TaskFormValues> = {
    title: task?.title || "",
    description: task?.description || "",
    dueDate: task?.dueDate,
    dueTime: task?.dueDate ? format(task.dueDate, "HH:mm") : "",
    priority: task?.priority || "medium",
    parentId: task?.parentId || parentId,
    completionDate: task?.completionDate,
  }

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || '',
        description: task?.description || '',
        dueDate: task?.dueDate,
        dueTime: task?.dueDate ? format(task.dueDate, "HH:mm") : "",
        priority: task?.priority || 'medium',
        parentId: task?.parentId || parentId,
        completionDate: task?.completionDate,
      });
    }
  }, [open, task, parentId, form]);


  function onSubmit(data: TaskFormValues) {
    let finalDueDate: Date | undefined = data.dueDate;

    if (data.dueDate && data.dueTime) {
        try {
            const time = parse(data.dueTime, "HH:mm", new Date());
            const hours = time.getHours();
            const minutes = time.getMinutes();
            finalDueDate = setMinutes(setHours(data.dueDate, hours), minutes);
        } catch(e) {
            // handle case where dueTime is not valid
            console.error("Invalid time format", e);
        }
    }

    const taskData = { ...data, dueDate: finalDueDate, parentId: data.parentId || parentId };
    
    if (isEditing && task && onTaskUpdate) {
      onTaskUpdate({ ...task, ...taskData });
    } else {
      onTaskSave(taskData as Omit<Task, 'id' | 'completed' | 'createdAt'> & { dueTime?: string });
    }
    form.reset();
    setOpen(false);
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update the details of your existing task." : "Fill out the form to add a new task to your list."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Finalize project report" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add more details about the task..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                         <FormControl>
                            <Button
                              variant={"outline"}
                              type="button"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                          />
                          <div className="p-2 border-t border-border">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  className="w-full justify-center text-muted-foreground"
                                  onClick={() => field.onChange(undefined)}
                              >
                                  <X className="mr-2 h-4 w-4" />
                                  Clear
                              </Button>
                          </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="dueTime"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Due Time</FormLabel>
                      <FormControl>
                          <Input
                          type="time"
                          {...field}
                          disabled={!form.watch("dueDate")}
                          />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
          </div>
          <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
              <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                      <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                  </Select>
                  <FormMessage />
              </FormItem>
              )}
          />
          {isEditing && task?.completed && (
            <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Completion Date</FormLabel>
                  <Popover>
                     <PopoverTrigger asChild>
                       <FormControl>
                          <Button
                            variant={"outline"}
                            type="button"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                        <div className="p-2 border-t border-border">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  className="w-full justify-center text-muted-foreground"
                                  onClick={() => field.onChange(undefined)}
                              >
                                  <X className="mr-2 h-4 w-4" />
                                  Clear
                              </Button>
                          </div>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                     If you need to change when a task was completed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <DialogFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Save Changes" : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {dialogContent}
    </Dialog>
  )
}
