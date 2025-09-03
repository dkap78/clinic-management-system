"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
  UserPlus,
  Clock,
  Activity,
  MessageSquare,
  Brain,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  full_name: string
  role: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id, full_name, role")
          .eq("id", authUser.id)
          .single()

        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.log("[v0] User data not available - database not initialized")
        setUser({
          id: authUser.id,
          full_name: authUser.email || "User",
          role: "doctor",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    sessionStorage.removeItem("selectedDoctorId")
    router.push("/auth/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Settings },
    { name: "Consultation", href: "/consultation", icon: MessageSquare },
    { name: "Doctors", href: "/doctors", icon: Stethoscope },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Medical Records", href: "/medical-records", icon: FileText },
    { name: "Vitals", href: "/medical-records/vitals", icon: Activity },
    { name: "Add Patient", href: "/patients/new", icon: UserPlus },
    { name: "Doctor Availability", href: "/doctors/availability", icon: Clock },
    ...(user?.role === "admin"
      ? [
          { name: "Admin Dashboard", href: "/admin", icon: Settings },
          { name: "User Management", href: "/admin/users", icon: Users },
        ]
      : []),
    { name: "AI Diagnosis", href: "/ai/diagnosis", icon: Brain },
    { name: "AI Search", href: "/ai/search", icon: Search },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white shadow-lg">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-blue-900">MediCare Clinic</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-auto">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-8">
                <h1 className="text-xl font-bold text-blue-900">MediCare Clinic</h1>
              </div>
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
