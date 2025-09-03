"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface VitalRecord {
  id: string
  patient_id: string
  recorded_date: string
  height: number
  weight: number
  bmi: number
  systolic_bp: number
  diastolic_bp: number
  heart_rate: number
  temperature: number
  oxygen_saturation: number
  patients: Patient
}

export default function VitalsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [vitals, setVitals] = useState<VitalRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    systolic_bp: "",
    diastolic_bp: "",
    heart_rate: "",
    temperature: "",
    oxygen_saturation: "",
  })

  useEffect(() => {
    loadPatients()
    const patientParam = searchParams.get("patient")
    if (patientParam) {
      setSelectedPatientId(patientParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedPatientId) {
      loadVitals()
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

  const loadVitals = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("patient_vitals")
        .select(`
          id,
          patient_id,
          recorded_date,
          height,
          weight,
          bmi,
          systolic_bp,
          diastolic_bp,
          heart_rate,
          temperature,
          oxygen_saturation,
          patients!inner(id, first_name, last_name)
        `)
        .eq("patient_id", selectedPatientId)
        .order("recorded_date", { ascending: false })

      if (error && !error.message.includes("does not exist")) {
        throw error
      }

      setVitals(data || [])
    } catch (error) {
      console.error("Error loading vitals:", error)
    }
  }

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return 0
    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const height = Number.parseFloat(formData.height)
      const weight = Number.parseFloat(formData.weight)
      const bmi = calculateBMI(height, weight)

      const { error } = await supabase.from("patient_vitals").insert({
        patient_id: selectedPatientId,
        recorded_date: new Date().toISOString().split("T")[0],
        height: height || null,
        weight: weight || null,
        bmi: bmi || null,
        systolic_bp: Number.parseFloat(formData.systolic_bp) || null,
        diastolic_bp: Number.parseFloat(formData.diastolic_bp) || null,
        heart_rate: Number.parseFloat(formData.heart_rate) || null,
        temperature: Number.parseFloat(formData.temperature) || null,
        oxygen_saturation: Number.parseFloat(formData.oxygen_saturation) || null,
      })

      if (error) throw error

      setFormData({
        height: "",
        weight: "",
        systolic_bp: "",
        diastolic_bp: "",
        heart_rate: "",
        temperature: "",
        oxygen_saturation: "",
      })
      setShowForm(false)
      loadVitals()
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save vitals")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { category: "Normal", color: "text-green-600" }
    if (systolic < 130 && diastolic < 80) return { category: "Elevated", color: "text-yellow-600" }
    if (systolic < 140 || diastolic < 90) return { category: "High Stage 1", color: "text-orange-600" }
    return { category: "High Stage 2", color: "text-red-600" }
  }

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
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
            <h1 className="text-3xl font-bold text-gray-900">Patient Vitals</h1>
            <p className="text-gray-600">Record and track patient vital signs</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!selectedPatientId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Patient</CardTitle>
              <CardDescription>Choose a patient to record vitals</CardDescription>
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

          {/* Vitals Form */}
          {showForm && selectedPatientId && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Record New Vitals
                </CardTitle>
                <CardDescription>Enter the patient's current vital signs</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
                        placeholder="170.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                        placeholder="70.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic_bp">Systolic BP (mmHg)</Label>
                      <Input
                        id="systolic_bp"
                        type="number"
                        value={formData.systolic_bp}
                        onChange={(e) => setFormData((prev) => ({ ...prev, systolic_bp: e.target.value }))}
                        placeholder="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic_bp">Diastolic BP (mmHg)</Label>
                      <Input
                        id="diastolic_bp"
                        type="number"
                        value={formData.diastolic_bp}
                        onChange={(e) => setFormData((prev) => ({ ...prev, diastolic_bp: e.target.value }))}
                        placeholder="80"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                      <Input
                        id="heart_rate"
                        type="number"
                        value={formData.heart_rate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, heart_rate: e.target.value }))}
                        placeholder="72"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) => setFormData((prev) => ({ ...prev, temperature: e.target.value }))}
                        placeholder="36.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                      <Input
                        id="oxygen_saturation"
                        type="number"
                        value={formData.oxygen_saturation}
                        onChange={(e) => setFormData((prev) => ({ ...prev, oxygen_saturation: e.target.value }))}
                        placeholder="98"
                      />
                    </div>
                  </div>

                  {formData.height && formData.weight && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Calculated BMI:{" "}
                        <strong>
                          {calculateBMI(Number.parseFloat(formData.height), Number.parseFloat(formData.weight))}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Saving..." : "Save Vitals"}
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

        {/* Vitals History */}
        {selectedPatientId && !showForm && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Vitals History</h2>
            {vitals.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vitals Recorded</h3>
                  <p className="text-gray-600 mb-4">No vital signs have been recorded for this patient yet.</p>
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Vitals
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vitals.map((vital, index) => {
                  const previousVital = vitals[index + 1]
                  const bmiInfo = getBMICategory(vital.bmi)
                  const bpInfo = getBPCategory(vital.systolic_bp, vital.diastolic_bp)

                  return (
                    <Card key={vital.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{new Date(vital.recorded_date).toLocaleDateString()}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {vital.height && vital.weight && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Height/Weight</span>
                            <div className="text-right">
                              <div className="font-medium">
                                {vital.height}cm / {vital.weight}kg
                              </div>
                              <div className={`text-sm ${bmiInfo.color}`}>
                                BMI: {vital.bmi} ({bmiInfo.category})
                              </div>
                            </div>
                          </div>
                        )}

                        {vital.systolic_bp && vital.diastolic_bp && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Blood Pressure</span>
                            <div className="text-right">
                              <div className="font-medium flex items-center gap-1">
                                {vital.systolic_bp}/{vital.diastolic_bp} mmHg
                                {previousVital && getTrend(vital.systolic_bp, previousVital.systolic_bp)}
                              </div>
                              <div className={`text-sm ${bpInfo.color}`}>{bpInfo.category}</div>
                            </div>
                          </div>
                        )}

                        {vital.heart_rate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Heart Rate</span>
                            <div className="font-medium flex items-center gap-1">
                              {vital.heart_rate} bpm
                              {previousVital && getTrend(vital.heart_rate, previousVital.heart_rate)}
                            </div>
                          </div>
                        )}

                        {vital.temperature && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Temperature</span>
                            <div className="font-medium flex items-center gap-1">
                              {vital.temperature}°C
                              {previousVital && getTrend(vital.temperature, previousVital.temperature)}
                            </div>
                          </div>
                        )}

                        {vital.oxygen_saturation && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Oxygen Saturation</span>
                            <div className="font-medium flex items-center gap-1">
                              {vital.oxygen_saturation}%
                              {previousVital && getTrend(vital.oxygen_saturation, previousVital.oxygen_saturation)}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
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
