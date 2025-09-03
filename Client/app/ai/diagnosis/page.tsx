"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain, AlertTriangle, CheckCircle } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

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
      const prompt = `As a medical AI assistant, analyze the following patient information and provide diagnostic insights:

Symptoms: ${symptoms}
Medical History: ${patientHistory || "None provided"}
Known Allergies: ${allergies || "None provided"}
Current Medications: ${currentMedications || "None provided"}

Please provide:
1. Possible differential diagnoses (most likely to least likely)
2. Recommended diagnostic tests or examinations
3. General treatment recommendations
4. Any red flags or urgent concerns
5. Lifestyle recommendations

Important: This is for educational purposes only and should not replace professional medical judgment.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 1000,
      })

      setDiagnosis(text)
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
      const prompt = `As a medical AI assistant, check the compatibility of the following medicine with the patient's profile:

Medicine/Treatment: ${medicineQuery}
Patient Allergies: ${allergies || "None provided"}
Current Medications: ${currentMedications || "None provided"}
Medical History: ${patientHistory || "None provided"}

Please analyze:
1. Potential allergic reactions
2. Drug interactions with current medications
3. Contraindications based on medical history
4. Dosage considerations
5. Monitoring requirements

Provide a clear compatibility assessment: SAFE, CAUTION, or CONTRAINDICATED with detailed reasoning.

Important: This is for educational purposes only and should not replace professional medical judgment.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 800,
      })

      setMedicineCheck(text)
    } catch (error) {
      console.error("Error checking medicine:", error)
      setMedicineCheck("Error occurred while checking compatibility. Please try again.")
    } finally {
      setIsCheckingMedicine(false)
    }
  }

  return (
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
  )
}
