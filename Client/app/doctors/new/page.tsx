"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import DoctorForm from "@/components/forms/doctor-form"

export default function NewDoctorPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
          <p className="text-gray-600">Create a new doctor profile in the system</p>
        </div>
        <DoctorForm />
      </div>
    </DashboardLayout>
  )
}
