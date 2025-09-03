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
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Doctor {
  id: string
  users: {
    full_name: string
  }
}

const visitTypes = [
  "Regular Checkup",
  "Follow-up",
  "Emergency",
  "Consultation",
  "Procedure",
  "Surgery",
  "Vaccination",
  "Lab Review",
  "Other",
]

export default function NewMedicalRecordPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    patient_id: searchParams.get("patient") || "",
    doctor_id: "",
    visit_date: new Date().toISOString().split("T")[0],
    visit_type: "",
    chief_complaint: "",
    history_of_present_illness: "",
    physical_examination: "",
    diagnosis: "",
    treatment_plan: "",
    medications_prescribed: "",
    follow_up_instructions: "",
    notes: "",
  })

  useEffect(() => {
    loadPatients()
    loadDoctors()
  }, [])

  const loadPatients = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("patients").select("id, first_name, last_name").order("first_name")

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw error
      }

      setPatients(data || [])
    } catch (error) {
      console.error("Error loading patients:", error)
      setError("Failed to load patients")
    }
  }

  const loadDoctors = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select(`
          id,
          users!inner(full_name)
        `)
        .order("users(full_name)")

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setDoctors(data || [])
    } catch (error) {
      console.error("Error loading doctors:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("medical_records").insert({
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        visit_date: formData.visit_date,
        visit_type: formData.visit_type,
        chief_complaint: formData.chief_complaint,
        history_of_present_illness: formData.history_of_present_illness,
        physical_examination: formData.physical_examination,
        diagnosis: formData.diagnosis,
        treatment_plan: formData.treatment_plan,
        medications_prescribed: formData.medications_prescribed,
        follow_up_instructions: formData.follow_up_instructions,
        notes: formData.notes,
      })

      if (error) throw error

      router.push("/medical-records")
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save medical record")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Medical Record</h1>
          <p className="text-gray-600">Create a new medical record for a patient visit</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medical Record Details</CardTitle>
            <CardDescription>Fill in the details of the patient visit</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_id">Patient</Label>
                  <Select value={formData.patient_id} onValueChange={(value) => handleInputChange("patient_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
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
                          Dr. {doctor.users.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_date">Visit Date</Label>
                  <Input
                    id="visit_date"
                    type="date"
                    value={formData.visit_date}
                    onChange={(e) => handleInputChange("visit_date", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit_type">Visit Type</Label>
                <Select value={formData.visit_type} onValueChange={(value) => handleInputChange("visit_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Chief Complaint</Label>
                <Textarea
                  id="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={(e) => handleInputChange("chief_complaint", e.target.value)}
                  placeholder="Patient's main concern or reason for visit..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                <Textarea
                  id="history_of_present_illness"
                  value={formData.history_of_present_illness}
                  onChange={(e) => handleInputChange("history_of_present_illness", e.target.value)}
                  placeholder="Detailed history of the current illness..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="physical_examination">Physical Examination</Label>
                <Textarea
                  id="physical_examination"
                  value={formData.physical_examination}
                  onChange={(e) => handleInputChange("physical_examination", e.target.value)}
                  placeholder="Physical examination findings..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                  placeholder="Primary and secondary diagnoses..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment_plan">Treatment Plan</Label>
                <Textarea
                  id="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={(e) => handleInputChange("treatment_plan", e.target.value)}
                  placeholder="Recommended treatment and interventions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications_prescribed">Medications Prescribed</Label>
                <Textarea
                  id="medications_prescribed"
                  value={formData.medications_prescribed}
                  onChange={(e) => handleInputChange("medications_prescribed", e.target.value)}
                  placeholder="List of prescribed medications with dosages..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
                <Textarea
                  id="follow_up_instructions"
                  value={formData.follow_up_instructions}
                  onChange={(e) => handleInputChange("follow_up_instructions", e.target.value)}
                  placeholder="Instructions for follow-up care..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes or observations..."
                  rows={2}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : "Save Medical Record"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/medical-records")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
