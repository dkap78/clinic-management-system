"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import PatientForm from "@/components/forms/patient-form"

export default function NewPatientPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
          <p className="text-gray-600">Create a new patient record in the system</p>
        </div>
        <PatientForm />
      </div>
    </DashboardLayout>
  )
}
