"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
  patients: {
    first_name: string
    last_name: string
  }
  doctors: {
    users: {
      full_name: string
    }
  }
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-yellow-100 text-yellow-800",
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [currentDate])

  const loadAppointments = async () => {
    const supabase = createClient()
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          doctor_id,
          appointment_date,
          appointment_time,
          status,
          type,
          patients!inner(first_name, last_name),
          doctors!inner(
            users!inner(full_name)
          )
        `)
        .gte("appointment_date", startOfMonth.toISOString().split("T")[0])
        .lte("appointment_date", endOfMonth.toISOString().split("T")[0])
        .order("appointment_time")

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw error
      }

      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
      setError("Failed to load appointments")
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return []
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.appointment_date === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Database Not Ready</h2>
            <p className="text-amber-700">{error}</p>
            <p className="text-sm text-amber-600 mt-2">
              Please run the SQL scripts from the project setup to initialize the database tables.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Calendar</h1>
            <p className="text-gray-600">View appointments in calendar format</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/appointments">
                <CalendarIcon className="h-4 w-4 mr-2" />
                List View
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/appointments/new">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading calendar...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600 border-b">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getDaysInMonth(currentDate).map((date, index) => {
                  const dayAppointments = getAppointmentsForDate(date)
                  const isToday = date && date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-1 border border-gray-200 ${
                        date ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                      } ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map((appointment) => (
                              <div
                                key={appointment.id}
                                className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                                title={`${appointment.patients.first_name} ${appointment.patients.last_name} - Dr. ${appointment.doctors.users.full_name} at ${formatTime(appointment.appointment_time)}`}
                              >
                                <Badge
                                  className={`${statusColors[appointment.status as keyof typeof statusColors]} text-xs px-1 py-0`}
                                >
                                  {formatTime(appointment.appointment_time)}
                                </Badge>
                                <div className="truncate mt-1">
                                  {appointment.patients.first_name} {appointment.patients.last_name}
                                </div>
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayAppointments.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
