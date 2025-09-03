"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Phone, Mail, Calendar, MapPin, User } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPatients = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase.from("patients").select("*").order("first_name")

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            setError("Database not initialized. Please run the SQL scripts first.")
            return
          }
          throw error
        }

        setPatients(data || [])
        setFilteredPatients(data || [])
      } catch (error) {
        console.error("Error loading patients:", error)
        setError("Failed to load patients")
      } finally {
        setIsLoading(false)
      }
    }

    loadPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm),
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

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
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600">Manage patient records and information</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No patients match your search criteria." : "Get started by adding your first patient."}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/patients/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {calculateAge(patient.date_of_birth)} years old, {patient.gender}
                      </CardDescription>
                    </div>
                    {patient.blood_group && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {patient.blood_group}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.phone}
                  </div>
                  {patient.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {patient.address.length > 30 ? `${patient.address.substring(0, 30)}...` : patient.address}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      Added {new Date(patient.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/patients/${patient.id}`}>
                        <Calendar className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
