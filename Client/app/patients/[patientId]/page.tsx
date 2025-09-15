"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import PatientForm from "@/components/forms/patient-form"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  blood_group: string
  created_at: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPatientDetail = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase.from("patients").select("*").eq("id", patientId).single()

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            setError("Database not initialized. Please run the SQL scripts first.")
            return
          }
          throw error
        }

        setPatient(data || {})
      } catch (error) {
        console.error("Error loading patients:", error)
        setError("Failed to load patients")
      } finally {
        setIsLoading(false)
      }
    }

    loadPatientDetail()
  }, [])

  return (
    <DashboardLayout>
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Patient Detail</h1>
            <p className="text-gray-600">Update Patient Detail</p>
            </div>
        {isLoading ? (
            <div>Loading Patient Detail, Please Wait...</div>
        ) : (
            <PatientForm patientId={patientId} initialData={patient} />
        )}
        </div>
    </DashboardLayout>
  )
}
