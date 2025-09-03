"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Brain, User, Calendar, FileText, Stethoscope } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function AISearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState("all")

  const performAISearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Simulate AI-enhanced search results for demo
      const analysisText = `
MEDICAL SEARCH ANALYSIS for "${searchQuery}":

RELATED CONDITIONS:
- Primary conditions matching search criteria
- Associated symptoms and presentations
- Differential diagnoses to consider

DIAGNOSTIC CRITERIA:
- Key symptoms and signs
- Laboratory findings
- Imaging characteristics

TREATMENT OPTIONS:
- First-line treatments
- Alternative therapies
- Medication considerations

DIAGNOSTIC TESTS:
- Recommended initial tests
- Confirmatory studies
- Monitoring parameters

PATIENT CARE:
- Management guidelines
- Follow-up recommendations
- Patient education points

Note: This is a simulated AI search for demonstration purposes.
      `

      const results = [
        {
          id: 1,
          type: "condition",
          title: `Medical Analysis: ${searchQuery}`,
          content: analysisText,
          relevance: 95,
          category: "AI Analysis",
        },
        // Simulate additional results
        {
          id: 2,
          type: "patient",
          title: "Related Patient Cases",
          content: "Found 3 patients with similar symptoms or conditions",
          relevance: 85,
          category: "Patient Records",
        },
        {
          id: 3,
          type: "appointment",
          title: "Upcoming Appointments",
          content: "Found 2 appointments related to this condition",
          relevance: 75,
          category: "Appointments",
        },
      ]

      setSearchResults(results)
    } catch (error) {
      console.error("Error performing AI search:", error)
      setSearchResults([
        {
          id: 1,
          type: "error",
          title: "Search Error",
          content: "Unable to perform search. Please try again.",
          relevance: 0,
          category: "Error",
        },
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "patient":
        return <User className="h-4 w-4" />
      case "appointment":
        return <Calendar className="h-4 w-4" />
      case "condition":
        return <Stethoscope className="h-4 w-4" />
      case "report":
        return <FileText className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getColorForRelevance = (relevance: number) => {
    if (relevance >= 90) return "bg-green-100 text-green-800"
    if (relevance >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Enhanced Search</h1>
          <p className="text-gray-600">Intelligent search across all medical records and data</p>
        </div>
      </div>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Medical Search</CardTitle>
          <CardDescription>
            Use natural language to search across patients, appointments, conditions, and medical data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for patients, conditions, symptoms, medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && performAISearch()}
              className="flex-1"
            />
            <Button onClick={performAISearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          <Tabs value={searchType} onValueChange={setSearchType}>
            <TabsList>
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <Badge variant="secondary">{searchResults.length} results found</Badge>
          </div>

          {searchResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconForType(result.type)}
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getColorForRelevance(result.relevance)}>{result.relevance}% match</Badge>
                    <Badge variant="outline">{result.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{result.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !isSearching && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No results found. Try a different search term.</p>
          </CardContent>
        </Card>
      )}
    </div>
    </DashboardLayout>
  )
}
