"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/layout/dashboard-layout"
import PatientForm from "@/components/forms/patient-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null)
  const [visitHistory, setVisitHistory] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isVisitsOpen, setIsVisitsOpen] = useState(false)
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false)

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

        // Load last visit and visit history
        const { data: records } = await supabase
          .from("medical_records")
          .select("id, visit_date, visit_type, diagnosis, chief_complaint")
          .eq("patient_id", patientId)
          .order("visit_date", { ascending: false })
          .limit(20)

        setVisitHistory(records || [])
        if (records && records.length > 0) {
          setLastVisitDate(records[0].visit_date)
        }

        // Load appointment history
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, type, notes")
          .eq("patient_id", patientId)
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false })

        setAppointments(appts || [])
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Detail</h1>
              <p className="text-gray-600">Update patient information and view history</p>
              {lastVisitDate && (
                <p className="text-sm text-gray-500 mt-2">Last visit: {new Date(lastVisitDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={isVisitsOpen} onOpenChange={setIsVisitsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Past Visits</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Past Visit History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {visitHistory.length === 0 ? (
                      <p className="text-sm text-gray-600">No past visits found.</p>
                    ) : (
                      visitHistory.map((record) => (
                        <Card key={record.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {new Date(record.visit_date).toLocaleDateString()} - {record.visit_type || "Visit"}
                              </div>
                              {record.diagnosis && <Badge variant="outline">Diagnosis</Badge>}
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              {record.diagnosis || record.chief_complaint || "No details available."}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAppointmentsOpen} onOpenChange={setIsAppointmentsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Appointments</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Appointment History</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-between items-center mb-2">
                    <a className="underline text-blue-600" href={`/appointments/new?patient=${patientId}`}>
                      Add Appointment
                    </a>
                  </div>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {appointments.length === 0 ? (
                      <p className="text-sm text-gray-600">No appointments found.</p>
                    ) : (
                      appointments.map((apt) => {
                        const isOpen = ["scheduled", "confirmed", "rescheduled", "in_progress"].includes(apt.status)
                        return (
                          <Card key={apt.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {new Date(apt.appointment_date).toLocaleDateString()} {" "}
                                  <span className="text-gray-500">
                                    {new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{apt.status}</Badge>
                                  {isOpen && (
                                    <a className="text-sm underline text-blue-600" href={`/appointments/${apt.id}`}>
                                      Modify
                                    </a>
                                  )}
                                </div>
                              </div>
                              {apt.notes && <div className="text-sm text-gray-600 mt-2">{apt.notes}</div>}
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
