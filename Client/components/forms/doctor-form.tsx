"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

const specializations = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Anesthesiology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
]

interface DoctorFormProps {
  doctorId?: string
  initialData?: any
}

export default function DoctorForm({ doctorId, initialData }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    full_name: (initialData?.first_name || "") + " " + (initialData?.last_name || ""),
    email: initialData?.email || "",
    password: "",
    specialization: initialData?.specialization || "",
    license_number: initialData?.license_number || "",
    phone: initialData?.phone || "",
    consultation_fee: initialData?.consultation_fee || "",
    is_available: initialData?.is_available ?? true,
    bio: initialData?.bio || "",
    experience_years: initialData?.experience_years || "",
    education: initialData?.education || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (doctorId) {
        // Update existing doctor
        const { error: updateError } = await supabase
          .from("doctors")
          .update({
            first_name: formData.full_name.split(' ')[0] || formData.full_name,
            last_name: formData.full_name.split(' ').slice(1).join(' ') || '',
            email: formData.email,
            specialization: formData.specialization,
            license_number: formData.license_number,
            phone: formData.phone,
            consultation_fee: Number.parseFloat(formData.consultation_fee),
            is_available: formData.is_available,
            bio: formData.bio,
            experience_years: Number.parseInt(formData.experience_years) || null,
            education: formData.education,
          })
          .eq("id", doctorId)

        if (updateError) throw updateError

        // Update user info
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({
            full_name: formData.full_name,
          })
          .eq("id", initialData.user_id)

        if (userUpdateError) throw userUpdateError
      } else {
        // Create new doctor
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: "doctor",
            },
          },
        })

        if (authError) throw authError

        if (authData.user) {
          // Create user record
          const { error: userError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: "doctor",
          })

          if (userError) throw userError

          // Create doctor record
          const { error: doctorError } = await supabase.from("doctors").insert({
            user_id: authData.user.id,
            first_name: formData.full_name.split(' ')[0] || formData.full_name,
            last_name: formData.full_name.split(' ').slice(1).join(' ') || '',
            email: formData.email,
            specialization: formData.specialization,
            license_number: formData.license_number,
            phone: formData.phone,
            consultation_fee: Number.parseFloat(formData.consultation_fee),
            is_available: formData.is_available,
            bio: formData.bio,
            experience_years: Number.parseInt(formData.experience_years) || null,
            education: formData.education,
          })

          if (doctorError) throw doctorError
        }
      }

      router.push("/doctors")
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "An error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{doctorId ? "Edit Doctor" : "Add New Doctor"}</CardTitle>
        <CardDescription>
          {doctorId ? "Update doctor information" : "Fill in the details to create a new doctor profile"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Dr. John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="doctor@clinic.com"
                required
                disabled={!!doctorId}
              />
            </div>
          </div>

          {!doctorId && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Secure password"
                required
                minLength={6}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={formData.specialization}
                onValueChange={(value) => handleInputChange("specialization", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => handleInputChange("license_number", e.target.value)}
                placeholder="MD123456"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
              <Input
                id="consultation_fee"
                type="number"
                min="0"
                step="0.01"
                value={formData.consultation_fee}
                onChange={(e) => handleInputChange("consultation_fee", e.target.value)}
                placeholder="150.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={(e) => handleInputChange("experience_years", e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => handleInputChange("is_available", checked)}
              />
              <Label htmlFor="is_available">Available for appointments</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              placeholder="MD from Harvard Medical School"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Brief description of the doctor's background and expertise..."
              rows={4}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Saving..." : doctorId ? "Update Doctor" : "Create Doctor"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/doctors")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
