"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AppointmentForm from "@/components/forms/appointment-form"
import { useSearchParams } from "next/navigation"

export default function NewAppointmentPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patient") || undefined
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
          <p className="text-gray-600">Schedule an appointment for a patient</p>
        </div>
        <AppointmentForm initialData={patientId ? { patient_id: patientId } : undefined} />
      </div>
    </DashboardLayout>
  )
}
