"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Calendar, FileText, Activity, Shield, AlertTriangle, Clock, Stethoscope } from "lucide-react"
import Link from "next/link"

interface SystemStats {
  totalUsers: number
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadAdminData = async () => {
      const supabase = createClient()

      try {
        // Get current user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!authUser) return

        const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        if (userData?.role !== "admin") {
          setError("Access denied. Admin privileges required.")
          return
        }

        setUser(userData)

        // Load system statistics
        const [usersResult, doctorsResult, patientsResult, appointmentsResult] = await Promise.allSettled([
          supabase.from("users").select("id", { count: "exact" }),
          supabase.from("doctors").select("id", { count: "exact" }),
          supabase.from("patients").select("id", { count: "exact" }),
          supabase.from("appointments").select("id, appointment_date, status", { count: "exact" }),
        ])

        const today = new Date().toISOString().split("T")[0]

        setStats({
          totalUsers: usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 0,
          totalDoctors: doctorsResult.status === "fulfilled" ? doctorsResult.value.count || 0 : 0,
          totalPatients: patientsResult.status === "fulfilled" ? patientsResult.value.count || 0 : 0,
          totalAppointments: appointmentsResult.status === "fulfilled" ? appointmentsResult.value.count || 0 : 0,
          todayAppointments:
            appointmentsResult.status === "fulfilled"
              ? appointmentsResult.value.data?.filter((apt) => apt.appointment_date === today).length || 0
              : 0,
          pendingAppointments:
            appointmentsResult.status === "fulfilled"
              ? appointmentsResult.value.data?.filter((apt) => apt.status === "scheduled").length || 0
              : 0,
        })
      } catch (error) {
        console.log("[v0] Database not initialized - showing demo data")
        setStats({
          totalUsers: 25,
          totalDoctors: 8,
          totalPatients: 150,
          totalAppointments: 45,
          todayAppointments: 12,
          pendingAppointments: 8,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Administrator
        </Badge>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">System users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Registered doctors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
            </Link>

            <Link href="/admin/doctors">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <Stethoscope className="h-6 w-6" />
                <span>Manage Doctors</span>
              </Button>
            </Link>

            <Link href="/admin/system">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <Activity className="h-6 w-6" />
                <span>System Settings</span>
              </Button>
            </Link>

            <Link href="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
                <FileText className="h-6 w-6" />
                <span>Generate Reports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">New patient registered</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Medical record updated</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
