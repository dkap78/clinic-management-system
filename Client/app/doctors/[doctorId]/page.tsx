"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import DoctorForm from "@/components/forms/doctor-form"

interface Doctor {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  specialization: string
  license_number: string
  phone: string
  is_available: boolean
  consultation_fee: number
  education: string
  qualification: string
  exprience_years: number
}

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorDetail = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase.from("doctors").select("*").eq("id", doctorId).single()

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            setError("Database not initialized. Please run the SQL scripts first.")
            return
          }
          throw error
        }

        setDoctor(data || {})
      } catch (error) {
        console.error("Error loading doctors:", error)
        setError("Failed to load doctors")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorDetail()
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Detail</h1>
          <p className="text-gray-600">Update doctor profile in the system</p>
        </div>
        {isLoading ? (
            <div>Loading Doctor Detail, Please Wait...</div>
        ) : (
            <DoctorForm doctorId={doctorId} initialData={doctor} />
        )}
      </div>
    </DashboardLayout>
  )
}
