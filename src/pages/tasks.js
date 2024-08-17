import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { callOpenAI } from "@/utils/openai";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const handleAddTask = async () => {
    if (newTask) {
      setIsLoading(true);
      try {
        const detailedTask = await getDetailedTask(newTask);
        setTasks([...tasks, { id: Date.now(), text: detailedTask, completed: false }]);
        setNewTask("");
      } catch (error) {
        console.error("Error detailing task:", error);
        alert(`Failed to detail task: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getDetailedTask = async (shortTask) => {
    const prompt = `Expand the following short task description into a more detailed one, including potential steps or considerations:

Task: ${shortTask}

Detailed Task:`;

    return await callOpenAI(prompt);
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAIPrioritize = async () => {
    if (tasks.length === 0) {
      alert("No tasks to prioritize.");
      return;
    }

    setIsLoading(true);
    try {
      const taskList = tasks.map(task => task.text).join("\n");
      const prompt = `Prioritize the following tasks in order of importance and urgency. For each task, provide a brief explanation of why it's placed in that position. Present the result as a numbered list:

${taskList}

Prioritized Tasks:`;

      const prioritizedTasks = await callOpenAI(prompt);
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        prioritizedTasks.split("\n").forEach((line, index) => {
          if (line.trim() && newTasks[index]) {
            newTasks[index] = { ...newTasks[index], text: line.trim() };
          }
        });
        return newTasks;
      });
    } catch (error) {
      console.error("Error prioritizing tasks:", error);
      alert(`Failed to prioritize tasks: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWriting = async (taskId) => {
    setIsLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      const prompt = `Complete the following task description with more details, steps, or considerations:

Current task: ${task.text}

Completed task description:`;

      const completedTask = await callOpenAI(prompt);
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, text: completedTask } : t
      ));
    } catch (error) {
      console.error("Error completing task writing:", error);
      alert(`Failed to complete task writing: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter task (AI will expand it)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleAddTask} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Task"}
          </Button>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
        {tasks.map((task) => (
          <Card key={task.id} className="mb-2">
            <CardContent className="flex items-start p-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id)}
                className="mr-2 mt-1"
              />
              <div className="flex-grow">
                <Textarea
                  value={task.text}
                  onChange={(e) => setTasks(tasks.map(t => 
                    t.id === task.id ? { ...t, text: e.target.value } : t
                  ))}
                  className={task.completed ? "line-through" : ""}
                  rows={3}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCompleteWriting(task.id)}
                  disabled={isLoading}
                  className="mt-2"
                >
                  Complete Writing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" onClick={handleAIPrioritize} disabled={isLoading || tasks.length === 0}>
        {isLoading ? "Prioritizing..." : "AI Prioritize Tasks"}
      </Button>
    </div>
  );
}