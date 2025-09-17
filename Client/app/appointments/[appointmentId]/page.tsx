"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import AppointmentForm from "@/components/forms/appointment-form"

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
  notes: string
  created_at: string
  patients: {
    first_name: string
    last_name: string
    phone: string
  }
  doctors: {
    first_name: string
    last_name: string
    specialization: string
  }
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAppointmentDetail = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase.from("appointments").select("*").eq("id", appointmentId).single()

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            setError("Database not initialized. Please run the SQL scripts first.")
            return
          }
          throw error
        }

        setAppointment(data || {})
      } catch (error) {
        console.error("Error loading appointments:", error)
        setError("Failed to load appointments")
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointmentDetail()
  }, [])

    return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointment Detail</h1>
          <p className="text-gray-600">Update appointment detail</p>
        </div>
        {isLoading ? (
            <div>Loading Doctor Detail, Please Wait...</div>
        ) : (
            <AppointmentForm appointmentId={appointmentId} initialData={appointment} />
        )}
      </div>
    </DashboardLayout>
  )
}
