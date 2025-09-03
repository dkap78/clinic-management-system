"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Search, Plus, Edit, Trash2, AlertTriangle, UserCheck, UserX } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  created_at: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      const supabase = createClient()

      try {
        // Check admin access
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!authUser) return

        const { data: userData } = await supabase.from("users").select("role").eq("id", authUser.id).single()

        if (userData?.role !== "admin") {
          setError("Access denied. Admin privileges required.")
          return
        }

        // Load all users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false })

        if (usersError) throw usersError
        setUsers(usersData || [])
      } catch (error) {
        console.log("[v0] Database not initialized - showing demo data")
        setUsers([
          {
            id: "1",
            full_name: "Dr. Sarah Johnson",
            email: "sarah.johnson@clinic.com",
            role: "doctor",
            status: "active",
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            full_name: "Admin User",
            email: "admin@clinic.com",
            role: "admin",
            status: "active",
            created_at: "2024-01-10T09:00:00Z",
          },
          {
            id: "3",
            full_name: "Nurse Mary Wilson",
            email: "mary.wilson@clinic.com",
            role: "nurse",
            status: "active",
            created_at: "2024-01-20T14:30:00Z",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "nurse":
        return "bg-green-100 text-green-800"
      case "receptionist":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <UserCheck className="h-4 w-4 text-green-600" />
    ) : (
      <UserX className="h-4 w-4 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by name, email, or role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.full_name}</h3>
                      {getStatusIcon(user.status)}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
