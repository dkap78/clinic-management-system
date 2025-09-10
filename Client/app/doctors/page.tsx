"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Phone, Mail, Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Doctor {
  id: string
  user_id: string
  specialization: string
  license_number: string
  phone: string
  is_available: boolean
  consultation_fee: number
  users: {
    full_name: string
    email: string
  }
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctors = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            email,
            specialization,
            license_number,
            phone,
            is_available,
            consultation_fee,
          `)
          .order("users(full_name)")

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            setError("Database not initialized. Please run the SQL scripts first.")
            return
          }
          throw error
        }

        setDoctors(data || [])
        setFilteredDoctors(data || [])
      } catch (error) {
        console.error("Error loading doctors:", error)
        setError("Failed to load doctors")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctors()
  }, [])

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

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
            <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
            <p className="text-gray-600">Manage doctor profiles and availability</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/doctors/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doctors..."
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
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No doctors match your search criteria." : "Get started by adding your first doctor."}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/doctors/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Dr. {doctor.first_name} {doctor.last_name}</CardTitle>
                      <CardDescription className="font-medium text-blue-600">{doctor.specialization}</CardDescription>
                    </div>
                    <Badge variant={doctor.is_available ? "default" : "secondary"}>
                      {doctor.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {doctor.phone || "Not provided"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    License: {doctor.license_number}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-green-600">Fee: ${doctor.consultation_fee}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctors/${doctor.id}`}>
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