"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Calendar, Activity, FileText, Clock, Phone, AlertCircle, Save, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  blood_group: string
  medical_history: string
  allergies: string
  current_medications: string
}

interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
  notes: string
  patients: Patient
}

interface MedicalRecord {
  id: string
  visit_date: string
  visit_type: string
  chief_complaint: string
  diagnosis: string
  treatment_plan: string
  medications_prescribed: string
}

interface VitalRecord {
  id: string
  recorded_date: string
  height: number
  weight: number
  bmi: number
  systolic_bp: number
  diastolic_bp: number
  heart_rate: number
  temperature: number
  oxygen_saturation: number
}

interface LabReport {
  id: string
  test_name: string
  test_date: string
  test_type: string
  results: string
  status: string
}

interface Template {
  id: string
  name: string
  type: string
  content: string
}

export default function ConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Consultation form data
  const [consultationData, setConsultationData] = useState({
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
    if (appointmentId) {
      loadConsultationData()
    }
  }, [appointmentId])

  const loadConsultationData = async () => {
    const supabase = createClient()
    try {
      // Load appointment details
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          doctor_id,
          appointment_date,
          appointment_time,
          status,
          type,
          notes,
          patients!inner(*)
        `)
        .eq("id", appointmentId)
        .single()

      if (appointmentError) {
        if (appointmentError.message.includes("does not exist") || appointmentError.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw appointmentError
      }

      setAppointment(appointmentData)

      if (appointmentData?.patient_id) {
        // Load medical records
        const { data: recordsData } = await supabase
          .from("medical_records")
          .select("*")
          .eq("patient_id", appointmentData.patient_id)
          .order("visit_date", { ascending: false })
          .limit(10)

        setMedicalRecords(recordsData || [])

        // Load vitals
        const { data: vitalsData } = await supabase
          .from("patient_vitals")
          .select("*")
          .eq("patient_id", appointmentData.patient_id)
          .order("recorded_date", { ascending: false })
          .limit(5)

        setVitals(vitalsData || [])

        // Load lab reports
        const { data: labData } = await supabase
          .from("lab_reports")
          .select("*")
          .eq("patient_id", appointmentData.patient_id)
          .order("test_date", { ascending: false })
          .limit(10)

        setLabReports(labData || [])
      }

      // Load templates
      const { data: templatesData } = await supabase.from("consultation_templates").select("*").order("name")

      setTemplates(templatesData || [])
    } catch (error) {
      console.error("Error loading consultation data:", error)
      setError("Failed to load consultation data")
    } finally {
      setIsLoading(false)
    }
  }

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

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const applyTemplate = (template: Template) => {
    if (template.type === "diagnosis") {
      setConsultationData((prev) => ({ ...prev, diagnosis: template.content }))
    } else if (template.type === "prescription") {
      setConsultationData((prev) => ({ ...prev, medications_prescribed: template.content }))
    } else if (template.type === "treatment") {
      setConsultationData((prev) => ({ ...prev, treatment_plan: template.content }))
    }
  }

  const saveConsultation = async () => {
    if (!appointment) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("medical_records").insert({
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        visit_date: appointment.appointment_date,
        visit_type: "Consultation",
        chief_complaint: consultationData.chief_complaint,
        history_of_present_illness: consultationData.history_of_present_illness,
        physical_examination: consultationData.physical_examination,
        diagnosis: consultationData.diagnosis,
        treatment_plan: consultationData.treatment_plan,
        medications_prescribed: consultationData.medications_prescribed,
        follow_up_instructions: consultationData.follow_up_instructions,
        notes: consultationData.notes,
      })

      if (error) throw error

      // Update appointment status to completed
      await supabase.from("appointments").update({ status: "completed" }).eq("id", appointmentId)

      router.push("/consultation")
    } catch (error: any) {
      setError(error.message || "Failed to save consultation")
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

  if (isLoading || !appointment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading consultation...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Patient Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {appointment.patients.first_name} {appointment.patients.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {calculateAge(appointment.patients.date_of_birth)} years old, {appointment.patients.gender}
                    </span>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {appointment.patients.phone}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(appointment.appointment_time)}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {appointment.patients.blood_group && (
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    Blood: {appointment.patients.blood_group}
                  </Badge>
                )}
                <Badge variant={appointment.type === "online" ? "secondary" : "outline"}>{appointment.type}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information Sidebar */}
          <div className="space-y-6">
            {/* Medical Alerts */}
            {(appointment.patients.allergies || appointment.patients.current_medications) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Medical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointment.patients.allergies && (
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Allergies</h4>
                      <p className="text-sm text-red-700 bg-red-50 p-2 rounded">{appointment.patients.allergies}</p>
                    </div>
                  )}
                  {appointment.patients.current_medications && (
                    <div>
                      <h4 className="font-medium text-orange-800 mb-1">Current Medications</h4>
                      <p className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                        {appointment.patients.current_medications}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Latest Vitals */}
            {vitals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Latest Vitals
                  </CardTitle>
                  <CardDescription>{new Date(vitals[0].recorded_date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vitals[0].systolic_bp && vitals[0].diastolic_bp && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                      <span className="font-medium">
                        {vitals[0].systolic_bp}/{vitals[0].diastolic_bp} mmHg
                      </span>
                    </div>
                  )}
                  {vitals[0].heart_rate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Heart Rate</span>
                      <span className="font-medium">{vitals[0].heart_rate} bpm</span>
                    </div>
                  )}
                  {vitals[0].temperature && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Temperature</span>
                      <span className="font-medium">{vitals[0].temperature}°C</span>
                    </div>
                  )}
                  {vitals[0].bmi && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">BMI</span>
                      <span className="font-medium">{vitals[0].bmi}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Lab Reports */}
            {labReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Lab Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {labReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex justify-between items-center text-sm">
                          <span>{report.test_name}</span>
                          <Badge variant={report.status === "normal" ? "default" : "secondary"}>{report.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Consultation Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="consultation" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="consultation">Current Consultation</TabsTrigger>
                <TabsTrigger value="history">Medical History</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="consultation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Notes</CardTitle>
                    <CardDescription>Record the current consultation details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chief_complaint">Chief Complaint</Label>
                      <Textarea
                        id="chief_complaint"
                        value={consultationData.chief_complaint}
                        onChange={(e) => setConsultationData((prev) => ({ ...prev, chief_complaint: e.target.value }))}
                        placeholder="Patient's main concern..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="history_of_present_illness">History of Present Illness</Label>
                      <Textarea
                        id="history_of_present_illness"
                        value={consultationData.history_of_present_illness}
                        onChange={(e) =>
                          setConsultationData((prev) => ({ ...prev, history_of_present_illness: e.target.value }))
                        }
                        placeholder="Detailed history..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physical_examination">Physical Examination</Label>
                      <Textarea
                        id="physical_examination"
                        value={consultationData.physical_examination}
                        onChange={(e) =>
                          setConsultationData((prev) => ({ ...prev, physical_examination: e.target.value }))
                        }
                        placeholder="Examination findings..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        value={consultationData.diagnosis}
                        onChange={(e) => setConsultationData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                        placeholder="Primary and secondary diagnoses..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="treatment_plan">Treatment Plan</Label>
                      <Textarea
                        id="treatment_plan"
                        value={consultationData.treatment_plan}
                        onChange={(e) => setConsultationData((prev) => ({ ...prev, treatment_plan: e.target.value }))}
                        placeholder="Treatment recommendations..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medications_prescribed">Medications Prescribed</Label>
                      <Textarea
                        id="medications_prescribed"
                        value={consultationData.medications_prescribed}
                        onChange={(e) =>
                          setConsultationData((prev) => ({ ...prev, medications_prescribed: e.target.value }))
                        }
                        placeholder="Prescribed medications with dosages..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
                      <Textarea
                        id="follow_up_instructions"
                        value={consultationData.follow_up_instructions}
                        onChange={(e) =>
                          setConsultationData((prev) => ({ ...prev, follow_up_instructions: e.target.value }))
                        }
                        placeholder="Follow-up care instructions..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={consultationData.notes}
                        onChange={(e) => setConsultationData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional observations..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button onClick={saveConsultation} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save & Complete Consultation
                      </Button>
                      <Button variant="outline" onClick={() => router.push("/consultation")}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>Previous visits and medical records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {medicalRecords.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">No previous medical records found.</p>
                    ) : (
                      <ScrollArea className="h-96">
                        <div className="space-y-4">
                          {medicalRecords.map((record) => (
                            <div key={record.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">
                                  {new Date(record.visit_date).toLocaleDateString()} - {record.visit_type}
                                </h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Chief Complaint:</span> {record.chief_complaint}
                                </div>
                                <div>
                                  <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                </div>
                                {record.medications_prescribed && (
                                  <div>
                                    <span className="font-medium">Medications:</span> {record.medications_prescribed}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Consultation Templates</CardTitle>
                    <CardDescription>Quick templates for common diagnoses and prescriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {templates.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No templates available.</p>
                        <Button asChild variant="outline">
                          <a href="/consultation/templates">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Templates
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template) => (
                          <div key={template.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{template.content}</p>
                            <Button size="sm" variant="outline" onClick={() => applyTemplate(template)}>
                              Apply Template
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
