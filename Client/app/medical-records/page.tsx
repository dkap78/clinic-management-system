"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Activity, Calendar, User, Stethoscope } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  blood_group: string
}

interface MedicalRecord {
  id: string
  patient_id: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  diagnosis: string
  treatment_plan: string
  patients: Patient
  doctors: {
    first_name: string
    last_name: string
  }
}

export default function MedicalRecordsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatientId) {
      loadMedicalRecords()
    } else {
      setMedicalRecords([])
    }
  }, [selectedPatientId])

  const loadPatients = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, email, phone, date_of_birth, blood_group")
        .order("first_name")

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
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedicalRecords = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          id,
          patient_id,
          visit_date,
          visit_type,
          chief_complaint,
          diagnosis,
          treatment_plan,
          patients!inner(id, first_name, last_name, email, phone, date_of_birth, blood_group),
          doctors!inner(
            first_name,
            last_name
          )
        `)
        .eq("patient_id", selectedPatientId)
        .order("visit_date", { ascending: false })

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setMedicalRecords(data || [])
    } catch (error) {
      console.error("Error loading medical records:", error)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm),
  )

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600">View and manage patient medical history</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/medical-records/vitals">
                <Activity className="h-4 w-4 mr-2" />
                Record Vitals
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/medical-records/lab-reports">
                <FileText className="h-4 w-4 mr-2" />
                Lab Reports
              </Link>
            </Button>
            {selectedPatientId && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href={`/medical-records/new?patient=${selectedPatientId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Record
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Patient
              </CardTitle>
              <CardDescription>Choose a patient to view their medical records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatientId === patient.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{calculateAge(patient.date_of_birth)} years old</div>
                      <div className="text-xs text-gray-500">{patient.phone}</div>
                      {patient.blood_group && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {patient.blood_group}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Records */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPatient ? (
              <>
                {/* Patient Info Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </span>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/medical-records/vitals?patient=${selectedPatientId}`}>
                            <Activity className="h-4 w-4 mr-1" />
                            Vitals
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/medical-records/lab-reports?patient=${selectedPatientId}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Lab Reports
                          </Link>
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Age: {calculateAge(selectedPatient.date_of_birth)} • Blood Group:{" "}
                      {selectedPatient.blood_group || "Not specified"} • Phone: {selectedPatient.phone}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Medical Records List */}
                {medicalRecords.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
                      <p className="text-gray-600 mb-4">This patient doesn't have any medical records yet.</p>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={`/medical-records/new?patient=${selectedPatientId}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Record
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <Card key={record.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {new Date(record.visit_date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4 mt-1">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {record.visit_type}
                                </span>
                                <span className="flex items-center">
                                  <Stethoscope className="h-4 w-4 mr-1" />
                                  Dr. {record.doctors.first_name} {record.doctors.last_name}
                                </span>
                              </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/medical-records/${record.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Chief Complaint</h4>
                              <p className="text-gray-700">{record.chief_complaint}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
                              <p className="text-gray-700">{record.diagnosis}</p>
                            </div>
                            {record.treatment_plan && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-1">Treatment Plan</h4>
                                <p className="text-gray-700">{record.treatment_plan}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-600">Choose a patient from the list to view their medical records.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}