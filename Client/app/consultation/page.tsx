"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video, MapPin, Phone, MessageSquare, Plus } from "lucide-react"
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
  notes: string
  patients: {
    first_name: string
    last_name: string
    phone: string
    email: string
  }
  doctors: {
    first_name: string
    last_name: string
    specialization: string
  }
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-purple-100 text-purple-800",
}

export default function ConsultationPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTodayAppointments()
  }, [])

  const loadTodayAppointments = async () => {
    const supabase = createClient()
    try {
      const today = new Date().toISOString().split("T")[0]

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
          notes,
          patients!inner(first_name, last_name, phone, email),
          doctors!inner(first_name, last_name, specialization)
        `)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "confirmed", "in_progress"])
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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const startConsultation = async (appointmentId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "in_progress" })
        .eq("id", appointmentId)

      if (error) throw error

      // Refresh the appointments list
      loadTodayAppointments()
    } catch (error) {
      console.error("Error starting consultation:", error)
    }
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Consultation Center</h1>
            <p className="text-gray-600">Manage patient consultations and medical records</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/consultation/templates">
                <MessageSquare className="h-4 w-4 mr-2" />
                Templates
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/appointments/new">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading today's appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Today</h3>
              <p className="text-gray-600 mb-4">There are no scheduled appointments for today.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/appointments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(appointment.appointment_time)}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Dr. {appointment.doctors.first_name} {appointment.doctors.last_name}
                          </span>
                          <span className="flex items-center">
                            {appointment.type === "online" ? (
                              <Video className="h-4 w-4 mr-1" />
                            ) : (
                              <MapPin className="h-4 w-4 mr-1" />
                            )}
                            {appointment.type === "online" ? "Video Call" : "In-Person"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                        {appointment.status.replace("_", " ")}
                      </Badge>
                      <div className="flex gap-2">
                        {appointment.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => startConsultation(appointment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Start Consultation
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/consultation/${appointment.id}`}>
                            {appointment.status === "in_progress" ? "Continue" : "View Details"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {appointment.patients.phone}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {appointment.doctors.specialization}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 italic max-w-md truncate">{appointment.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common consultation tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/medical-records/vitals">
                  <Calendar className="h-6 w-6" />
                  <span>Record Vitals</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/medical-records/lab-reports">
                  <MessageSquare className="h-6 w-6" />
                  <span>Lab Reports</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Link href="/consultation/templates">
                  <User className="h-6 w-6" />
                  <span>Templates</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}