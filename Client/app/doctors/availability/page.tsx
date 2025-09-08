"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Plus, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Doctor {
  id: string
  user_id: string
  users: {
    full_name: string
  }
  specialization: string
}

interface DoctorAvailability {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

interface SpecialDate {
  id: string
  doctor_id: string
  date: string
  is_available: boolean
  start_time?: string
  end_time?: string
  reason?: string
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function DoctorAvailabilityPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: "",
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
  })

  const [newSpecialDate, setNewSpecialDate] = useState({
    date: "",
    is_available: true,
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
  })

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctorId) {
      loadDoctorAvailability()
      loadSpecialDates()
    }
  }, [selectedDoctorId])

  const loadDoctors = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id,
          user_id,
          specialization,
          users!inner(full_name)
        `)
        .order("users(full_name)")

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw error
      }

      setDoctors(data || [])
      if (data && data.length > 0) {
        setSelectedDoctorId(data[0].id)
      }
    } catch (error) {
      console.error("Error loading doctors:", error)
      setError("Failed to load doctors")
    }
  }

  const loadDoctorAvailability = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", selectedDoctorId)
        .order("day_of_week")

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setAvailability(data || [])
    } catch (error) {
      console.error("Error loading availability:", error)
    }
  }

  const loadSpecialDates = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("doctor_special_dates")
        .select("*")
        .eq("doctor_id", selectedDoctorId)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date")

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setSpecialDates(data || [])
    } catch (error) {
      console.error("Error loading special dates:", error)
    }
  }

  const saveAvailability = async () => {
    if (!newAvailability.day_of_week) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("doctor_availability").upsert(
        {
          doctor_id: selectedDoctorId,
          day_of_week: Number.parseInt(newAvailability.day_of_week),
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
          is_available: newAvailability.is_available,
        },
        {
          onConflict: "doctor_id,day_of_week",
        },
      )

      if (error) throw error

      setNewAvailability({
        day_of_week: "",
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
      })

      loadDoctorAvailability()
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save availability")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const saveSpecialDate = async () => {
    if (!newSpecialDate.date) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("doctor_special_dates").upsert(
        {
          doctor_id: selectedDoctorId,
          date: newSpecialDate.date,
          is_available: newSpecialDate.is_available,
          start_time: newSpecialDate.is_available ? newSpecialDate.start_time : null,
          end_time: newSpecialDate.is_available ? newSpecialDate.end_time : null,
          reason: newSpecialDate.reason || null,
        },
        {
          onConflict: "doctor_id,date",
        },
      )

      if (error) throw error

      setNewSpecialDate({
        date: "",
        is_available: true,
        start_time: "09:00",
        end_time: "17:00",
        reason: "",
      })

      loadSpecialDates()
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save special date")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAvailability = async (id: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("doctor_availability").delete().eq("id", id)

      if (error) throw error
      loadDoctorAvailability()
    } catch (error) {
      console.error("Error deleting availability:", error)
    }
  }

  const deleteSpecialDate = async (id: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("doctor_special_dates").delete().eq("id", id)

      if (error) throw error
      loadSpecialDates()
    } catch (error) {
      console.error("Error deleting special date:", error)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Availability</h1>
          <p className="text-gray-600">Manage doctor schedules and availability</p>
        </div>

        {doctors.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-600">No doctors found. Please add doctors first.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Select Doctor</CardTitle>
                <CardDescription>Choose a doctor to manage their availability</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedDoctorId && (
              <>
                {/* Weekly Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Weekly Availability
                    </CardTitle>
                    <CardDescription>Set regular weekly working hours</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add new availability */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                      <Select
                        value={newAvailability.day_of_week}
                        onValueChange={(value) => setNewAvailability((prev) => ({ ...prev, day_of_week: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayNames.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="time"
                        value={newAvailability.start_time}
                        onChange={(e) => setNewAvailability((prev) => ({ ...prev, start_time: e.target.value }))}
                        disabled={!newAvailability.is_available}
                      />

                      <Input
                        type="time"
                        value={newAvailability.end_time}
                        onChange={(e) => setNewAvailability((prev) => ({ ...prev, end_time: e.target.value }))}
                        disabled={!newAvailability.is_available}
                      />

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newAvailability.is_available}
                          onCheckedChange={(checked) =>
                            setNewAvailability((prev) => ({ ...prev, is_available: checked }))
                          }
                        />
                        <Label>Available</Label>
                      </div>

                      <Button onClick={saveAvailability} disabled={isLoading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Current availability */}
                    <div className="space-y-2">
                      {availability.map((avail) => (
                        <div key={avail.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium w-24">{dayNames[avail.day_of_week]}</span>
                            {avail.is_available ? (
                              <span className="text-sm text-gray-600">
                                {avail.start_time} - {avail.end_time}
                              </span>
                            ) : (
                              <Badge variant="secondary">Not Available</Badge>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => deleteAvailability(avail.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Special Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Special Dates
                    </CardTitle>
                    <CardDescription>Override availability for specific dates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add special date */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                      <Input
                        type="date"
                        value={newSpecialDate.date}
                        onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split("T")[0]}
                      />

                      <Input
                        type="time"
                        value={newSpecialDate.start_time}
                        onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, start_time: e.target.value }))}
                        disabled={!newSpecialDate.is_available}
                      />

                      <Input
                        type="time"
                        value={newSpecialDate.end_time}
                        onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, end_time: e.target.value }))}
                        disabled={!newSpecialDate.is_available}
                      />

                      <Input
                        placeholder="Reason (optional)"
                        value={newSpecialDate.reason}
                        onChange={(e) => setNewSpecialDate((prev) => ({ ...prev, reason: e.target.value }))}
                      />

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newSpecialDate.is_available}
                          onCheckedChange={(checked) =>
                            setNewSpecialDate((prev) => ({ ...prev, is_available: checked }))
                          }
                        />
                        <Label>Available</Label>
                      </div>

                      <Button onClick={saveSpecialDate} disabled={isLoading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Current special dates */}
                    <div className="space-y-2">
                      {specialDates.map((special) => (
                        <div key={special.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium w-32">{new Date(special.date).toLocaleDateString()}</span>
                            {special.is_available ? (
                              <span className="text-sm text-gray-600">
                                {special.start_time} - {special.end_time}
                              </span>
                            ) : (
                              <Badge variant="secondary">Not Available</Badge>
                            )}
                            {special.reason && <span className="text-sm text-gray-500">({special.reason})</span>}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => deleteSpecialDate(special.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
