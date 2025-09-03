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
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Download, Calendar, User } from "lucide-react"
import { useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface LabReport {
  id: string
  patient_id: string
  test_name: string
  test_date: string
  test_type: string
  results: string
  reference_range: string
  status: string
  notes: string
  ordered_by_doctor_id: string
  patients: Patient
  doctors: {
    users: {
      full_name: string
    }
  }
}

const testTypes = [
  "Blood Test",
  "Urine Test",
  "X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
  "ECG",
  "Echocardiogram",
  "Biopsy",
  "Pathology",
  "Microbiology",
  "Other",
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  abnormal: "bg-red-100 text-red-800",
  normal: "bg-blue-100 text-blue-800",
}

export default function LabReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    test_name: "",
    test_date: new Date().toISOString().split("T")[0],
    test_type: "",
    results: "",
    reference_range: "",
    status: "pending",
    notes: "",
    ordered_by_doctor_id: "",
  })

  useEffect(() => {
    loadPatients()
    loadDoctors()
    const patientParam = searchParams.get("patient")
    if (patientParam) {
      setSelectedPatientId(patientParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedPatientId) {
      loadLabReports()
    }
  }, [selectedPatientId])

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

  const loadLabReports = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("lab_reports")
        .select(`
          id,
          patient_id,
          test_name,
          test_date,
          test_type,
          results,
          reference_range,
          status,
          notes,
          ordered_by_doctor_id,
          patients!inner(id, first_name, last_name),
          doctors!inner(
            users!inner(full_name)
          )
        `)
        .eq("patient_id", selectedPatientId)
        .order("test_date", { ascending: false })

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setLabReports(data || [])
    } catch (error) {
      console.error("Error loading lab reports:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("lab_reports").insert({
        patient_id: selectedPatientId,
        test_name: formData.test_name,
        test_date: formData.test_date,
        test_type: formData.test_type,
        results: formData.results,
        reference_range: formData.reference_range,
        status: formData.status,
        notes: formData.notes,
        ordered_by_doctor_id: formData.ordered_by_doctor_id || null,
      })

      if (error) throw error

      setFormData({
        test_name: "",
        test_date: new Date().toISOString().split("T")[0],
        test_type: "",
        results: "",
        reference_range: "",
        status: "pending",
        notes: "",
        ordered_by_doctor_id: "",
      })
      setShowForm(false)
      loadLabReports()
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save lab report")
      }
    } finally {
      setIsLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Lab Reports</h1>
            <p className="text-gray-600">Manage patient laboratory test results</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedPatientId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lab Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
              <CardDescription>Choose a patient to view lab reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
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
            </CardContent>
          </Card>

          {/* Lab Report Form */}
          {showForm && selectedPatientId && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Add Lab Report
                </CardTitle>
                <CardDescription>Enter laboratory test results</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test_name">Test Name</Label>
                      <Input
                        id="test_name"
                        value={formData.test_name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, test_name: e.target.value }))}
                        placeholder="Complete Blood Count"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test_date">Test Date</Label>
                      <Input
                        id="test_date"
                        type="date"
                        value={formData.test_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, test_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test_type">Test Type</Label>
                      <Select
                        value={formData.test_type}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, test_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          {testTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="abnormal">Abnormal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ordered_by_doctor_id">Ordered By Doctor</Label>
                    <Select
                      value={formData.ordered_by_doctor_id}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, ordered_by_doctor_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor (optional)" />
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
                    <Label htmlFor="results">Results</Label>
                    <Textarea
                      id="results"
                      value={formData.results}
                      onChange={(e) => setFormData((prev) => ({ ...prev, results: e.target.value }))}
                      placeholder="Enter test results..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_range">Reference Range</Label>
                    <Input
                      id="reference_range"
                      value={formData.reference_range}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reference_range: e.target.value }))}
                      placeholder="Normal range values"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or observations..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Saving..." : "Save Report"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lab Reports List */}
        {selectedPatientId && !showForm && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Lab Reports History</h2>
            {labReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Reports</h3>
                  <p className="text-gray-600 mb-4">No laboratory reports have been recorded for this patient yet.</p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {labReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.test_name}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(report.test_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {report.test_type}
                            </span>
                            {report.doctors && (
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Dr. {report.doctors.users.full_name}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                            {report.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Results</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{report.results}</p>
                        </div>
                        {report.reference_range && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Reference Range</h4>
                            <p className="text-gray-700">{report.reference_range}</p>
                          </div>
                        )}
                        {report.notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                            <p className="text-gray-700">{report.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
