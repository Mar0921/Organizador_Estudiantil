// Global Variables
let pomodoroTimer
let isRunning = false
let timeLeft
let isWorkSession = true
let totalTime = 25 * 60

// Data Storage
let tasks = JSON.parse(localStorage.getItem("tasks")) || []
let notes = JSON.parse(localStorage.getItem("notes")) || []
let subjects = JSON.parse(localStorage.getItem("clases")) || []
let goals = JSON.parse(localStorage.getItem("metas")) || []
let grades = JSON.parse(localStorage.getItem("materias")) || []

// DOM Elements
const navButtons = document.querySelectorAll(".nav-btn")
const contentSections = document.querySelectorAll(".content-section")

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  loadDashboardStats()
  loadTasks()
  loadNotes()
  loadSubjects()
  loadGoals()
  updateSubjectOptions()
  initializePomodoro()

  // Check for reminders every minute
  setInterval(checkReminders, 60000)
  checkReminders()
})

// Navigation System
function initializeNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSection = button.dataset.section
      switchSection(targetSection)

      // Update active nav button
      navButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")
    })
  })
}

function switchSection(sectionId) {
  contentSections.forEach((section) => {
    section.classList.remove("active")
  })

  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.add("active")
  }
}

// Dashboard Functions
function loadDashboardStats() {
  const pendingTasks = tasks.filter((task) => !task.completed).length
  const totalSubjects = subjects.length
  const activeGoals = goals.filter((goal) => !goal.completed).length
  const averageGrade = calculateAverageGrade()

  document.getElementById("pendingTasks").textContent = pendingTasks
  document.getElementById("totalSubjects").textContent = totalSubjects
  document.getElementById("activeGoals").textContent = activeGoals
  document.getElementById("averageGrade").textContent = averageGrade

  loadRecentTasks()
}

function loadRecentTasks() {
  const recentTasksList = document.getElementById("recentTasksList")
  const recentTasks = tasks.slice(-3).reverse()

  if (recentTasks.length === 0) {
    recentTasksList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-task'></i>
                <p>No hay tareas recientes</p>
            </div>
        `
    return
  }

  recentTasksList.innerHTML = recentTasks
    .map(
      (task) => `
        <div class="task-item ${task.completed ? "completed" : ""}">
            <div class="task-title">${task.name}</div>
            <div class="task-meta">
                ${task.subTasks ? `<div><i class='bx bx-list-ul'></i> ${task.subTasks}</div>` : ""}
                ${task.hours ? `<div><i class='bx bx-time'></i> ${task.hours} horas</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

function calculateAverageGrade() {
  if (grades.length === 0) return "0.0"

  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0)
  const weightedSum = grades.reduce((sum, grade) => sum + grade.grade * grade.credits, 0)

  return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(1) : "0.0"
}

// Pomodoro Timer Functions
function initializePomodoro() {
  const workMinutes = Number.parseInt(document.getElementById("workTime").value) || 25
  timeLeft = workMinutes * 60
  totalTime = timeLeft
  updateTimerDisplay()
}

function startPomodoro() {
  if (isRunning) return

  const workMinutes = Number.parseInt(document.getElementById("workTime").value) || 25
  const breakMinutes = Number.parseInt(document.getElementById("breakTime").value) || 5

  if (!timeLeft) {
    timeLeft = isWorkSession ? workMinutes * 60 : breakMinutes * 60
    totalTime = timeLeft
  }

  isRunning = true
  document.getElementById("startBtn").style.opacity = "0.5"

  pomodoroTimer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--
      updateTimerDisplay()
      updateProgressBar()
    } else {
      clearInterval(pomodoroTimer)
      isRunning = false
      document.getElementById("startBtn").style.opacity = "1"

      // Show notification
      showNotification("Pomodoro Completado", isWorkSession ? "¡Tiempo de descanso!" : "¡Hora de trabajar!")

      // Switch session
      isWorkSession = !isWorkSession
      timeLeft = isWorkSession ? workMinutes * 60 : breakMinutes * 60
      totalTime = timeLeft
      updateTimerDisplay()
      updateProgressBar()
    }
  }, 1000)
}

function pausePomodoro() {
  clearInterval(pomodoroTimer)
  isRunning = false
  document.getElementById("startBtn").style.opacity = "1"
}

function resetPomodoro() {
  clearInterval(pomodoroTimer)
  isRunning = false
  isWorkSession = true

  const workMinutes = Number.parseInt(document.getElementById("workTime").value) || 25
  timeLeft = workMinutes * 60
  totalTime = timeLeft

  updateTimerDisplay()
  updateProgressBar()
  document.getElementById("startBtn").style.opacity = "1"
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  document.getElementById("timerDisplay").textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function updateProgressBar() {
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  document.getElementById("progressBar").style.width = `${progress}%`
}

// Task Management Functions
function addTask() {
  const taskName = document.getElementById("taskName").value.trim()
  const subTasks = document.getElementById("subTasks").value.trim()
  const taskHours = document.getElementById("taskHours").value.trim()
  const taskReminder = document.getElementById("taskReminder").value

  if (!taskName) {
    showNotification("Error", "Por favor, ingresa un nombre para la tarea.")
    return
  }

  const task = {
    id: Date.now().toString(),
    name: taskName,
    subTasks: subTasks,
    hours: taskHours,
    reminder: taskReminder ? new Date(taskReminder).toISOString() : null,
    completed: false,
    notified: false,
    createdAt: new Date().toISOString(),
  }

  tasks.push(task)
  localStorage.setItem("tasks", JSON.stringify(tasks))

  // Clear form
  document.getElementById("taskName").value = ""
  document.getElementById("subTasks").value = ""
  document.getElementById("taskHours").value = ""
  document.getElementById("taskReminder").value = ""

  loadTasks()
  loadDashboardStats()
  showNotification("Éxito", "Tarea agregada correctamente")
}

function loadTasks() {
  const tasksList = document.getElementById("tasksList")

  if (tasks.length === 0) {
    tasksList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-task'></i>
                <p>No hay tareas creadas</p>
            </div>
        `
    return
  }

  tasksList.innerHTML = tasks
    .map(
      (task) => `
        <div class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
            <div class="task-header">
                <div class="task-title">${task.name}</div>
                <div class="task-actions">
                    <button class="complete-btn" onclick="toggleTask('${task.id}')" title="${task.completed ? "Marcar como pendiente" : "Marcar como completada"}">
                        <i class='bx ${task.completed ? "bx-undo" : "bx-check"}'></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')" title="Eliminar tarea">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                ${task.subTasks ? `<div><i class='bx bx-list-ul'></i> ${task.subTasks}</div>` : ""}
                ${task.hours ? `<div><i class='bx bx-time'></i> ${task.hours} horas estimadas</div>` : ""}
                ${task.reminder ? `<div><i class='bx bx-bell'></i> ${new Date(task.reminder).toLocaleString()}</div>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
  localStorage.setItem("tasks", JSON.stringify(tasks))
  loadTasks()
  loadDashboardStats()
}

function deleteTask(taskId) {
  if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
    tasks = tasks.filter((task) => task.id !== taskId)
    localStorage.setItem("tasks", JSON.stringify(tasks))
    loadTasks()
    loadDashboardStats()
    showNotification("Éxito", "Tarea eliminada correctamente")
  }
}

// Notes Management Functions
function agregarNota() {
  const noteText = document.getElementById("noteInput").value.trim()
  const noteSubject = document.getElementById("notaMateria").value

  if (!noteText || !noteSubject) {
    showNotification("Error", "Por favor, completa todos los campos.")
    return
  }

  const note = {
    id: Date.now().toString(),
    text: noteText,
    subject: noteSubject,
    createdAt: new Date().toISOString(),
  }

  notes.push(note)
  localStorage.setItem("notes", JSON.stringify(notes))

  // Clear form
  document.getElementById("noteInput").value = ""
  document.getElementById("notaMateria").value = ""

  loadNotes()
  showNotification("Éxito", "Nota agregada correctamente")
}

function loadNotes() {
  const notesList = document.getElementById("notesList")

  if (notes.length === 0) {
    notesList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-note'></i>
                <p>No hay notas creadas</p>
            </div>
        `
    return
  }

  notesList.innerHTML = notes
    .map(
      (note) => `
        <div class="note-item" data-id="${note.id}">
            <div class="note-header">
                <div class="note-subject">${note.subject}</div>
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Eliminar nota">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
            <div class="note-content">${note.text}</div>
            <div class="note-date">${new Date(note.createdAt).toLocaleDateString()}</div>
        </div>
    `,
    )
    .join("")
}

function deleteNote(noteId) {
  if (confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
    notes = notes.filter((note) => note.id !== noteId)
    localStorage.setItem("notes", JSON.stringify(notes))
    loadNotes()
    showNotification("Éxito", "Nota eliminada correctamente")
  }
}

// Subjects Management Functions
function createClass() {
  const className = document.getElementById("className").value.trim()
  const classTeacher = document.getElementById("classTeacher").value.trim()

  if (!className || !classTeacher) {
    showNotification("Error", "Por favor, completa todos los campos.")
    return
  }

  if (subjects.some((subject) => subject.name === className)) {
    showNotification("Error", "Esta materia ya existe.")
    return
  }

  const subject = {
    id: Date.now().toString(),
    name: className,
    teacher: classTeacher,
    createdAt: new Date().toISOString(),
  }

  subjects.push(subject)
  localStorage.setItem("clases", JSON.stringify(subjects))

  // Clear form
  document.getElementById("className").value = ""
  document.getElementById("classTeacher").value = ""

  loadSubjects()
  updateSubjectOptions()
  loadDashboardStats()
  showNotification("Éxito", "Materia creada correctamente")
}

function loadSubjects() {
  const subjectsContainer = document.getElementById("clases-container")

  if (subjects.length === 0) {
    subjectsContainer.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-book'></i>
                <p>No hay materias creadas</p>
            </div>
        `
    return
  }

  subjectsContainer.innerHTML = subjects
    .map(
      (subject) => `
        <div class="subject-item" data-id="${subject.id}" onclick="openSubject('${subject.id}')">
            <div class="subject-name">${subject.name}</div>
            <div class="subject-teacher">Prof. ${subject.teacher}</div>
        </div>
    `,
    )
    .join("")
}

function openSubject(subjectId) {
  const subject = subjects.find((s) => s.id === subjectId)
  if (subject) {
    const url = `btn1.html?nombre=${encodeURIComponent(subject.name)}&docente=${encodeURIComponent(subject.teacher)}`
    window.location.href = url
  }
}

function limpiarClases() {
  if (confirm("¿Estás seguro de que quieres eliminar todas las materias?")) {
    subjects = []
    localStorage.removeItem("clases")
    loadSubjects()
    updateSubjectOptions()
    loadDashboardStats()
    showNotification("Éxito", "Todas las materias han sido eliminadas")
  }
}

function updateSubjectOptions() {
  const selectElement = document.getElementById("notaMateria")
  selectElement.innerHTML = '<option value="">Selecciona una materia</option>'

  subjects.forEach((subject) => {
    const option = document.createElement("option")
    option.value = subject.name
    option.textContent = subject.name
    selectElement.appendChild(option)
  })
}

// Goals Management Functions
function crearMeta() {
  const title = document.getElementById("metaTitulo").value.trim()
  const description = document.getElementById("metaDescripcion").value.trim()
  const deadline = document.getElementById("metaFechaLimite").value
  const category = document.getElementById("metaCategoria").value

  if (!title || !deadline) {
    showNotification("Error", "Por favor, completa el título y la fecha límite.")
    return
  }

  const goal = {
    id: Date.now().toString(),
    title: title,
    description: description,
    deadline: deadline,
    category: category,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  goals.push(goal)
  localStorage.setItem("metas", JSON.stringify(goals))

  // Clear form
  document.getElementById("metaTitulo").value = ""
  document.getElementById("metaDescripcion").value = ""
  document.getElementById("metaFechaLimite").value = ""
  document.getElementById("metaCategoria").value = "academica"

  loadGoals()
  loadDashboardStats()
  showNotification("Éxito", "Meta creada correctamente")
}

function loadGoals() {
  const goalsList = document.getElementById("listaMetas")

  if (goals.length === 0) {
    goalsList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-target-lock'></i>
                <p>No hay metas creadas</p>
            </div>
        `
    return
  }

  goalsList.innerHTML = goals
    .map(
      (goal) => `
        <div class="goal-item ${goal.completed ? "completed" : ""}" data-id="${goal.id}">
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-category ${goal.category}">${goal.category === "academica" ? "Académica" : "Personal"}</div>
            </div>
            ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ""}
            <div class="goal-deadline">
                <i class='bx bx-calendar'></i>
                Fecha límite: ${new Date(goal.deadline).toLocaleDateString()}
            </div>
            <div class="goal-actions">
                <button class="btn btn-primary" onclick="toggleGoal('${goal.id}')">
                    <i class='bx ${goal.completed ? "bx-undo" : "bx-check"}'></i>
                    ${goal.completed ? "Desmarcar" : "Completar"}
                </button>
                <button class="btn btn-danger" onclick="deleteGoal('${goal.id}')">
                    <i class='bx bx-trash'></i>
                    Eliminar
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function toggleGoal(goalId) {
  goals = goals.map((goal) => (goal.id === goalId ? { ...goal, completed: !goal.completed } : goal))
  localStorage.setItem("metas", JSON.stringify(goals))
  loadGoals()
  loadDashboardStats()
}

function deleteGoal(goalId) {
  if (confirm("¿Estás seguro de que quieres eliminar esta meta?")) {
    goals = goals.filter((goal) => goal.id !== goalId)
    localStorage.setItem("metas", JSON.stringify(goals))
    loadGoals()
    loadDashboardStats()
    showNotification("Éxito", "Meta eliminada correctamente")
  }
}

function limpiarMetas() {
  if (confirm("¿Estás seguro de que quieres eliminar todas las metas?")) {
    goals = []
    localStorage.removeItem("metas")
    loadGoals()
    loadDashboardStats()
    showNotification("Éxito", "Todas las metas han sido eliminadas")
  }
}

// Reminder System
function checkReminders() {
  const now = new Date()

  tasks.forEach((task, index) => {
    if (task.reminder && !task.notified && !task.completed) {
      const reminderTime = new Date(task.reminder)

      if (reminderTime <= now) {
        showNotification("Recordatorio de Tarea", `Tienes una tarea pendiente: ${task.name}`)

        // Mark as notified
        tasks[index].notified = true
        localStorage.setItem("tasks", JSON.stringify(tasks))
      }
    }
  })
}

// Notification System
function showNotification(title, message) {
  const modal = document.getElementById("notificationModal")
  const messageElement = document.getElementById("notificationMessage")

  messageElement.textContent = message
  modal.classList.add("show")

  // Auto close after 5 seconds
  setTimeout(() => {
    cerrarNotificacion()
  }, 5000)
}

function cerrarNotificacion() {
  const modal = document.getElementById("notificationModal")
  modal.classList.remove("show")
}

// Utility Functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Export/Import Functions (for future use)
function exportData() {
  const data = {
    tasks: tasks,
    notes: notes,
    subjects: subjects,
    goals: goals,
    grades: grades,
    exportDate: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })

  const link = document.createElement("a")
  link.href = URL.createObjectURL(dataBlob)
  link.download = "organizador-estudiantil-backup.json"
  link.click()
}

function importData(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)

      if (confirm("¿Estás seguro de que quieres importar estos datos? Esto sobrescribirá todos los datos actuales.")) {
        tasks = data.tasks || []
        notes = data.notes || []
        subjects = data.subjects || []
        goals = data.goals || []
        grades = data.grades || []

        // Save to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks))
        localStorage.setItem("notes", JSON.stringify(notes))
        localStorage.setItem("clases", JSON.stringify(subjects))
        localStorage.setItem("metas", JSON.stringify(goals))
        localStorage.setItem("materias", JSON.stringify(grades))

        // Reload all data
        loadTasks()
        loadNotes()
        loadSubjects()
        loadGoals()
        updateSubjectOptions()
        loadDashboardStats()

        showNotification("Éxito", "Datos importados correctamente")
      }
    } catch (error) {
      showNotification("Error", "Error al importar los datos. Verifica que el archivo sea válido.")
    }
  }
  reader.readAsText(file)
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + 1-5 for navigation
  if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "5") {
    e.preventDefault()
    const sections = ["dashboard", "tasks", "notes", "subjects", "goals"]
    const sectionIndex = Number.parseInt(e.key) - 1
    if (sections[sectionIndex]) {
      switchSection(sections[sectionIndex])
      navButtons[sectionIndex].classList.add("active")
      navButtons.forEach((btn, index) => {
        if (index !== sectionIndex) btn.classList.remove("active")
      })
    }
  }

  // Escape to close notifications
  if (e.key === "Escape") {
    cerrarNotificacion()
  }
})

// Service Worker Registration (for future PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed")
      })
  })
}

// Theme Toggle (for future dark mode)
function toggleTheme() {
  document.body.classList.toggle("dark-theme")
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light")
}

// Load saved theme
const savedTheme = localStorage.getItem("theme")
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme")
}
