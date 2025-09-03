"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain, AlertTriangle, CheckCircle } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function AIDiagnosisPage() {
  const [symptoms, setSymptoms] = useState("")
  const [patientHistory, setPatientHistory] = useState("")
  const [allergies, setAllergies] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [recommendations, setRecommendations] = useState("")
  const [medicineQuery, setMedicineQuery] = useState("")
  const [medicineCheck, setMedicineCheck] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCheckingMedicine, setIsCheckingMedicine] = useState(false)

  const analyzeDiagnosis = async () => {
    if (!symptoms.trim()) return

    setIsAnalyzing(true)
    try {
      // Simulate AI analysis for demo purposes
      const analysisResult = `
DIAGNOSTIC ANALYSIS:

Based on the provided symptoms: ${symptoms}
Medical History: ${patientHistory || "None provided"}
Allergies: ${allergies || "None provided"}
Current Medications: ${currentMedications || "None provided"}

DIFFERENTIAL DIAGNOSES:
1. Most likely: Viral upper respiratory infection
2. Possible: Bacterial sinusitis
3. Consider: Allergic rhinitis

RECOMMENDED TESTS:
- Complete blood count if fever persists
- Throat culture if bacterial infection suspected

TREATMENT RECOMMENDATIONS:
- Symptomatic treatment with rest and fluids
- Paracetamol for fever and pain
- Decongestants if needed

RED FLAGS:
- High fever >101.5°F
- Difficulty breathing
- Severe throat pain

LIFESTYLE RECOMMENDATIONS:
- Adequate rest and hydration
- Avoid close contact with others
- Hand hygiene

Note: This is a simulated AI analysis for demonstration purposes.
      `
      
      setDiagnosis(analysisResult)
    } catch (error) {
      console.error("Error analyzing diagnosis:", error)
      setDiagnosis("Error occurred while analyzing. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const checkMedicineCompatibility = async () => {
    if (!medicineQuery.trim()) return

    setIsCheckingMedicine(true)
    try {
      // Simulate medicine compatibility check
      const compatibilityResult = `
MEDICINE COMPATIBILITY ANALYSIS:

Medicine: ${medicineQuery}
Patient Profile:
- Allergies: ${allergies || "None provided"}
- Current Medications: ${currentMedications || "None provided"}
- Medical History: ${patientHistory || "None provided"}

COMPATIBILITY ASSESSMENT: SAFE ✓

ANALYSIS:
1. No known allergic reactions identified
2. No significant drug interactions detected
3. No contraindications based on medical history
4. Standard dosing appropriate
5. Routine monitoring recommended

RECOMMENDATIONS:
- Start with lowest effective dose
- Monitor for side effects
- Take with food if stomach upset occurs
- Follow up in 2 weeks

Note: This is a simulated compatibility check for demonstration purposes.
      `
      
      setMedicineCheck(compatibilityResult)
    } catch (error) {
      console.error("Error checking medicine:", error)
      setMedicineCheck("Error occurred while checking compatibility. Please try again.")
    } finally {
      setIsCheckingMedicine(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Diagnosis Assistant</h1>
          <p className="text-gray-600">AI-powered medical analysis and compatibility checking</p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This AI assistant is for educational and support purposes only. Always consult with qualified healthcare
          professionals for medical decisions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information Input */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Enter patient details for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Symptoms *</label>
              <Textarea
                placeholder="Describe the patient's current symptoms..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Medical History</label>
              <Textarea
                placeholder="Previous conditions, surgeries, chronic diseases..."
                value={patientHistory}
                onChange={(e) => setPatientHistory(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Known Allergies</label>
              <Input
                placeholder="Drug allergies, food allergies, etc."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Medications</label>
              <Input
                placeholder="Current medications and dosages"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
              />
            </div>

            <Button onClick={analyzeDiagnosis} disabled={isAnalyzing || !symptoms.trim()} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Diagnosis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Medicine Compatibility Checker */}
        <Card>
          <CardHeader>
            <CardTitle>Medicine Compatibility Checker</CardTitle>
            <CardDescription>Check medicine compatibility with patient profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Medicine/Treatment</label>
              <Input
                placeholder="Enter medicine name or treatment..."
                value={medicineQuery}
                onChange={(e) => setMedicineQuery(e.target.value)}
              />
            </div>

            <Button
              onClick={checkMedicineCompatibility}
              disabled={isCheckingMedicine || !medicineQuery.trim()}
              className="w-full"
            >
              {isCheckingMedicine ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Compatibility
                </>
              )}
            </Button>

            {medicineCheck && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Compatibility Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">{medicineCheck}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis Results */}
      {diagnosis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Diagnosis Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{diagnosis}</div>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}
