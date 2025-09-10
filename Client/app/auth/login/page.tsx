"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Doctor {
  id: string
  user_id: string
  specialization: string
  users: {
    full_name: string
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDoctors = async () => {
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from("doctors")
          .select(`
            id,
            user_id,
            specialization,
            users!inner(full_name)
          `)
          .eq("is_available", true)

        if (error) {
          if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
            console.log("[v0] Database tables not yet created. Please run the SQL scripts first.")
            setDoctors([])
            return
          }
          throw error
        }
        setDoctors(data || [])
      } catch (error) {
        console.error("Error loading doctors:", error)
        setDoctors([])
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (doctors.length > 0 && !selectedDoctorId) {
      setError("Please select a doctor")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (selectedDoctorId) {
        sessionStorage.setItem("selectedDoctorId", selectedDoctorId)
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">MediCare Clinic</h1>
            <p className="text-blue-600">Comprehensive Healthcare Management</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Login</CardTitle>
              <CardDescription>Enter your credentials and select your doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@clinic.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="doctor">Select Doctor</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingDoctors
                              ? "Loading doctors..."
                              : doctors.length === 0
                                ? "No doctors available - run SQL scripts first"
                                : "Choose a doctor"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.length === 0 && !loadingDoctors ? (
                          <SelectItem value="none" disabled>
                            No doctors available
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!loadingDoctors && doctors.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        Database tables not found. Please run the SQL scripts from the project setup to initialize the
                        database.
                      </p>
                    )}
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || loadingDoctors}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Need an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
                  >
                    Contact Administrator
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
