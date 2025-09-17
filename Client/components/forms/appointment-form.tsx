"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface Doctor {
  id: string
  user_id: string
  first_name: string
  last_name: string
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

interface AppointmentFormProps {
  appointmentId?: string
  initialData?: any
}

export default function AppointmentForm({ appointmentId, initialData }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || "",
    doctor_id: initialData?.doctor_id || "",
    appointment_date: initialData?.appointment_date || "",
    appointment_time: initialData?.appointment_time || "",
    type: initialData?.type || "offline",
    notes: initialData?.notes || "",
    status: initialData?.status || "scheduled",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      try {
        // Load patients
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("id, first_name, last_name, email, phone")
          .order("first_name")

        if (patientsError && !patientsError.message.includes("does not exist")) {
          throw patientsError
        }

        // Load doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("doctors")
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            specialization
          `)
          .eq("is_available", true)
          .order("first_name")

        if (doctorsError && !doctorsError.message.includes("does not exist")) {
          throw doctorsError
        }

        setPatients(patientsData || [])
        setDoctors(doctorsData || [])
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      loadAvailableSlots()
    }
  }, [formData.doctor_id, formData.appointment_date])

  const loadAvailableSlots = async () => {
    const supabase = createClient()
    try {
      const selectedDate = new Date(formData.appointment_date)
      const dayOfWeek = selectedDate.getDay()

      // Get doctor availability for the selected day
      const { data: availability, error: availabilityError } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", formData.doctor_id)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)

      if (availabilityError && !availabilityError.message.includes("does not exist")) {
        throw availabilityError
      }

      // Get existing appointments for the selected date and doctor
      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("doctor_id", formData.doctor_id)
        .eq("appointment_date", formData.appointment_date)
        .in("status", ["scheduled", "confirmed"])

      if (appointmentsError && !appointmentsError.message.includes("does not exist")) {
        throw appointmentsError
      }

      // Generate available time slots
      const slots: string[] = []
      if (availability && availability.length > 0) {
        const { start_time, end_time } = availability[0]
        const startHour = Number.parseInt(start_time.split(":")[0])
        const endHour = Number.parseInt(end_time.split(":")[0])

        const bookedTimes = (existingAppointments || []).map((apt) => apt.appointment_time)

        for (let hour = startHour; hour < endHour; hour++) {
          const timeSlot = `${hour.toString().padStart(2, "0")}:00`
          if (!bookedTimes.includes(timeSlot)) {
            slots.push(timeSlot)
          }

          const halfHourSlot = `${hour.toString().padStart(2, "0")}:30`
          if (!bookedTimes.includes(halfHourSlot)) {
            slots.push(halfHourSlot)
          }
        }
      }

      setAvailableSlots(slots)
    } catch (error) {
      console.error("Error loading available slots:", error)
      // Generate default slots if availability system isn't set up
      const defaultSlots = []
      for (let hour = 9; hour < 17; hour++) {
        defaultSlots.push(`${hour.toString().padStart(2, "0")}:00`)
        defaultSlots.push(`${hour.toString().padStart(2, "0")}:30`)
      }
      setAvailableSlots(defaultSlots)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const appointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        type: formData.type,
        notes: formData.notes,
        status: formData.status,
      }

      if (appointmentId) {
        // Update existing appointment
        const { error: updateError } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointmentId)

        if (updateError) throw updateError
      } else {
        // Create new appointment
        const { error: insertError } = await supabase.from("appointments").insert(appointmentData)

        if (insertError) throw insertError
      }

      router.push("/appointments")
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (patients.length === 0 || doctors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Setup Required</h3>
              <p className="text-amber-700 mb-4">
                {patients.length === 0 && doctors.length === 0
                  ? "Please add patients and doctors before booking appointments."
                  : patients.length === 0
                    ? "Please add patients before booking appointments."
                    : "Please add doctors before booking appointments."}
              </p>
              <div className="space-x-2">
                {patients.length === 0 && (
                  <Button asChild variant="outline">
                    <a href="/patients/new">Add Patient</a>
                  </Button>
                )}
                {doctors.length === 0 && (
                  <Button asChild variant="outline">
                    <a href="/doctors/new">Add Doctor</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{appointmentId ? "Edit Appointment" : "Book New Appointment"}</CardTitle>
        <CardDescription>
          {appointmentId ? "Update appointment details" : "Fill in the details to schedule a new appointment"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient</Label>
              <Select value={formData.patient_id} onValueChange={(value) => handleInputChange("patient_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor</Label>
              <Select value={formData.doctor_id} onValueChange={(value) => handleInputChange("doctor_id", value)}>
                <SelectTrigger>
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Appointment Date</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange("appointment_date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_time">Appointment Time</Label>
              <Select
                value={formData.appointment_time.toString().substring(0,5)}
                onValueChange={(value) => handleInputChange("appointment_time", value)}
                disabled={!formData.doctor_id || !formData.appointment_date}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !formData.doctor_id || !formData.appointment_date
                        ? "Select doctor and date first"
                        : availableSlots.length === 0
                          ? "No slots available"
                          : "Select time"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {new Date(`2000-01-01T${slot}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Appointment Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline">In-Person (Offline)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Video Call (Online)</Label>
              </div>
            </RadioGroup>
          </div>

          {appointmentId && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes or special instructions..."
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Saving..." : appointmentId ? "Update Appointment" : "Book Appointment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/appointments")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
