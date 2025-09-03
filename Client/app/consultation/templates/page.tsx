"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FileText } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Template {
  id: string
  name: string
  type: string
  content: string
  created_at: string
}

const templateTypes = [
  { value: "diagnosis", label: "Diagnosis" },
  { value: "prescription", label: "Prescription" },
  { value: "treatment", label: "Treatment Plan" },
  { value: "followup", label: "Follow-up Instructions" },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    content: "",
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("consultation_templates").select("*").order("name")

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setError("Database not initialized. Please run the SQL scripts first.")
          return
        }
        throw error
      }

      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
      setError("Failed to load templates")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("consultation_templates")
          .update({
            name: formData.name,
            type: formData.type,
            content: formData.content,
          })
          .eq("id", editingTemplate.id)

        if (error) throw error
      } else {
        // Create new template
        const { error } = await supabase.from("consultation_templates").insert({
          name: formData.name,
          type: formData.type,
          content: formData.content,
        })

        if (error) throw error
      }

      setFormData({ name: "", type: "", content: "" })
      setShowForm(false)
      setEditingTemplate(null)
      loadTemplates()
    } catch (error: any) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Database not initialized. Please run the SQL scripts first.")
      } else {
        setError(error.message || "Failed to save template")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
    })
    setShowForm(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("consultation_templates").delete().eq("id", templateId)

      if (error) throw error
      loadTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", type: "", content: "" })
    setShowForm(false)
    setEditingTemplate(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Consultation Templates</h1>
            <p className="text-gray-600">Manage templates for diagnoses, prescriptions, and treatment plans</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? "Cancel" : "Add Template"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</CardTitle>
              <CardDescription>
                {editingTemplate ? "Update the template details" : "Create a reusable template for consultations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Common Cold Treatment"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Template Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template type" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the template content..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates</h3>
              <p className="text-gray-600 mb-4">Create your first consultation template to get started.</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline">
                          {templateTypes.find((t) => t.value === template.type)?.label || template.type}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-4">{template.content}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
