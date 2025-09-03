"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AppointmentForm from "@/components/forms/appointment-form"

export default function NewAppointmentPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
          <p className="text-gray-600">Schedule an appointment for a patient</p>
        </div>
        <AppointmentForm />
      </div>
    </DashboardLayout>
  )
}
