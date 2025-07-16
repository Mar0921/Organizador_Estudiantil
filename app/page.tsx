"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Target,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Music,
  Trash2,
  GraduationCap,
  StickyNote,
  ListTodo,
  Calculator,
} from "lucide-react"

interface Task {
  id: string
  name: string
  subTasks: string
  hours: string
  completed: boolean
}

interface Note {
  id: string
  text: string
  subject: string
}

interface Subject {
  id: string
  name: string
  teacher: string
}

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  category: string
  completed: boolean
}

interface Grade {
  id: string
  subject: string
  credits: number
  grade: number
}

export default function StudentOrganizer() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  // Pomodoro state
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)

  // Form states
  const [newTask, setNewTask] = useState({ name: "", subTasks: "", hours: "" })
  const [newNote, setNewNote] = useState({ text: "", subject: "" })
  const [newSubject, setNewSubject] = useState({ name: "", teacher: "" })
  const [newGoal, setNewGoal] = useState({ title: "", description: "", deadline: "", category: "academic" })
  const [newGrade, setNewGrade] = useState({ subject: "", credits: "", grade: "" })

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      alert("¡Tiempo terminado!")
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const addTask = () => {
    if (newTask.name.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        subTasks: newTask.subTasks,
        hours: newTask.hours,
        completed: false,
      }
      setTasks([...tasks, task])
      setNewTask({ name: "", subTasks: "", hours: "" })
    }
  }

  const addNote = () => {
    if (newNote.text.trim() && newNote.subject) {
      const note: Note = {
        id: Date.now().toString(),
        text: newNote.text,
        subject: newNote.subject,
      }
      setNotes([...notes, note])
      setNewNote({ text: "", subject: "" })
    }
  }

  const addSubject = () => {
    if (newSubject.name.trim() && newSubject.teacher.trim()) {
      const subject: Subject = {
        id: Date.now().toString(),
        name: newSubject.name,
        teacher: newSubject.teacher,
      }
      setSubjects([...subjects, subject])
      setNewSubject({ name: "", teacher: "" })
    }
  }

  const addGoal = () => {
    if (newGoal.title.trim() && newGoal.deadline) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        deadline: newGoal.deadline,
        category: newGoal.category,
        completed: false,
      }
      setGoals([...goals, goal])
      setNewGoal({ title: "", description: "", deadline: "", category: "academic" })
    }
  }

  const addGrade = () => {
    if (newGrade.subject && newGrade.credits && newGrade.grade) {
      const grade: Grade = {
        id: Date.now().toString(),
        subject: newGrade.subject,
        credits: Number.parseFloat(newGrade.credits),
        grade: Number.parseFloat(newGrade.grade),
      }
      setGrades([...grades, grade])
      setNewGrade({ subject: "", credits: "", grade: "" })
    }
  }

  const calculateGPA = () => {
    if (grades.length === 0) return 0
    const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0)
    const weightedSum = grades.reduce((sum, grade) => sum + grade.grade * grade.credits, 0)
    return (weightedSum / totalCredits).toFixed(2)
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const toggleGoal = (id: string) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const deleteGrade = (id: string) => {
    setGrades(grades.filter((grade) => grade.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <GraduationCap className="h-10 w-10 text-purple-400" />
            Organizador Estudiantil
          </h1>
          <p className="text-slate-300">Gestiona tu vida académica de manera eficiente</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600">
              <ListTodo className="h-4 w-4 mr-2" />
              Tareas
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-purple-600">
              <StickyNote className="h-4 w-4 mr-2" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-purple-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Materias
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-purple-600">
              <Target className="h-4 w-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-purple-600">
              <Calculator className="h-4 w-4 mr-2" />
              Calificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pomodoro Timer */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Temporizador Pomodoro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-purple-400 mb-4">{formatTime(timeLeft)}</div>
                    <Progress value={(1 - timeLeft / pomodoroTime) * 100} className="mb-4" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      variant={isRunning ? "secondary" : "default"}
                      size="sm"
                    >
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsRunning(false)
                        setTimeLeft(pomodoroTime)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Estadísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Tareas Pendientes</span>
                    <Badge variant="secondary">{tasks.filter((t) => !t.completed).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Materias</span>
                    <Badge variant="secondary">{subjects.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Metas Activas</span>
                    <Badge variant="secondary">{goals.filter((g) => !g.completed).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Promedio General</span>
                    <Badge variant="default">{calculateGPA()}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Spotify Player */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Music className="h-5 w-5 text-green-400" />
                    Música de Estudio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
                    width="100%"
                    height="200"
                    frameBorder="0"
                    allow="encrypted-media"
                    className="rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Calendar */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=es-419%23week%40group.v.calendar.google.com&ctz=America%2FMexico_City"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  className="rounded-lg"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Agregar Nueva Tarea</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nombre de la tarea"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Subtareas (separadas por comas)"
                    value={newTask.subTasks}
                    onChange={(e) => setNewTask({ ...newTask, subTasks: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Horas estimadas"
                    type="number"
                    value={newTask.hours}
                    onChange={(e) => setNewTask({ ...newTask, hours: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={addTask} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tarea
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-semibold ${task.completed ? "line-through text-slate-400" : "text-white"}`}>
                        {task.name}
                      </h3>
                      <div className="flex gap-1">
                        <Button onClick={() => toggleTask(task.id)} variant="ghost" size="sm">
                          <CheckCircle2 className={`h-4 w-4 ${task.completed ? "text-green-400" : "text-slate-400"}`} />
                        </Button>
                        <Button onClick={() => deleteTask(task.id)} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    {task.subTasks && (
                      <p className="text-sm text-slate-300 mb-2">
                        <strong>Subtareas:</strong> {task.subTasks}
                      </p>
                    )}
                    {task.hours && (
                      <p className="text-sm text-slate-300">
                        <strong>Horas:</strong> {task.hours}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Agregar Nueva Nota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribe tu nota aquí..."
                  value={newNote.text}
                  onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
                <Select value={newNote.subject} onValueChange={(value) => setNewNote({ ...newNote, subject: value })}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addNote} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nota
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card key={note.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {note.subject}
                      </Badge>
                      <Button onClick={() => deleteNote(note.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{note.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Agregar Nueva Materia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nombre de la materia"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Nombre del profesor"
                    value={newSubject.teacher}
                    onChange={(e) => setNewSubject({ ...newSubject, teacher: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={addSubject} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Materia
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2">{subject.name}</h3>
                    <p className="text-slate-300 text-sm">
                      <strong>Profesor:</strong> {subject.teacher}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Agregar Nueva Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título de la meta"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Textarea
                  placeholder="Descripción de la meta"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Académica</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Meta
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <Card key={goal.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold ${goal.completed ? "line-through text-slate-400" : "text-white"}`}
                        >
                          {goal.title}
                        </h3>
                        <Badge variant={goal.category === "academic" ? "default" : "secondary"}>
                          {goal.category === "academic" ? "Académica" : "Personal"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={() => toggleGoal(goal.id)} variant="ghost" size="sm">
                          <CheckCircle2 className={`h-4 w-4 ${goal.completed ? "text-green-400" : "text-slate-400"}`} />
                        </Button>
                        <Button onClick={() => deleteGoal(goal.id)} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{goal.description}</p>
                    <p className="text-slate-400 text-xs">
                      <strong>Fecha límite:</strong> {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Agregar Calificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={newGrade.subject}
                    onValueChange={(value) => setNewGrade({ ...newGrade, subject: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecciona materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Créditos"
                    type="number"
                    value={newGrade.credits}
                    onChange={(e) => setNewGrade({ ...newGrade, credits: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Calificación (0-10)"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={newGrade.grade}
                    onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={addGrade} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Calificación
                </Button>
              </CardContent>
            </Card>

            {grades.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Promedio General
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {calculateGPA()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grades.map((grade) => (
                <Card key={grade.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white">{grade.subject}</h3>
                      <Button onClick={() => deleteGrade(grade.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-300 text-sm">
                        <strong>Créditos:</strong> {grade.credits}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <strong>Calificación:</strong> {grade.grade}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
