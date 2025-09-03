"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Stethoscope, Calendar, User, Clock } from "lucide-react"
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
    id: string
    first_name: string
    last_name: string
    phone: string
    date_of_birth: string
    blood_group: string
  }
  doctors: {
    users: {
      full_name: string
    }
  }
}

export default function ConsultationPage() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
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
          patients!inner(id, first_name, last_name, phone, date_of_birth, blood_group),
          doctors!inner(
            users!inner(full_name)
          )
        `)
        .eq("appointment_date", today)
        .in("status", ["scheduled", "confirmed"])
        .order("appointment_time")

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw error
      }

      setTodayAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
      setError("Failed to load appointments")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = todayAppointments.filter(
    (appointment) =>
      `${appointment.patients.first_name} ${appointment.patients.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctors.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
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
            <h1 className="text-3xl font-bold text-gray-900">Consultation Dashboard</h1>
            <p className="text-gray-600">Start consultations and view patient information</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/consultation/templates">
                <Plus className="h-4 w-4 mr-2" />
                Manage Templates
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Appointments</span>
                <span className="font-semibold">{todayAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="font-semibold text-blue-600">
                  {todayAppointments.filter((apt) => apt.status === "scheduled").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">
                  {todayAppointments.filter((apt) => apt.status === "confirmed").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Appointments</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <CardDescription>Click on an appointment to start consultation</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {todayAppointments.length === 0 ? "No Appointments Today" : "No Matching Appointments"}
                    </h3>
                    <p className="text-gray-600">
                      {todayAppointments.length === 0
                        ? "You don't have any appointments scheduled for today."
                        : "No appointments match your search criteria."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => (window.location.href = `/consultation/${appointment.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {appointment.patients.first_name} {appointment.patients.last_name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatTime(appointment.appointment_time)}
                                </span>
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {calculateAge(appointment.patients.date_of_birth)} years old
                                </span>
                                <span className="flex items-center">
                                  <Stethoscope className="h-4 w-4 mr-1" />
                                  Dr. {appointment.doctors.users.full_name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.patients.blood_group && (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                {appointment.patients.blood_group}
                              </Badge>
                            )}
                            <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                              {appointment.status}
                            </Badge>
                            <Badge variant={appointment.type === "online" ? "secondary" : "outline"}>
                              {appointment.type}
                            </Badge>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Start Consultation
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
