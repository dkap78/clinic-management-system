import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Users, FileText, Shield, Brain, Search } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">MediCare Clinic</h1>
          <p className="text-xl text-blue-700 mb-8 max-w-2xl mx-auto">
            Comprehensive Healthcare Management System for Multiple Doctors and Specialties
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Login to System</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CalendarCheck className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle className="text-blue-900">Smart Scheduling</CardTitle>
              <CardDescription>
                Advanced appointment management with online/offline booking, rescheduling, and doctor availability
                customization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle className="text-green-900">Patient Management</CardTitle>
              <CardDescription>
                Complete patient profiles with medical history, vitals tracking, and comprehensive health records
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle className="text-orange-900">Digital Records</CardTitle>
              <CardDescription>
                Lab reports, prescriptions, diagnosis templates, and complete consultation documentation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <Brain className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-purple-900">AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent diagnosis assistance, drug interaction alerts, and personalized treatment recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <Search className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle className="text-indigo-900">Smart Search</CardTitle>
              <CardDescription>
                AI-enhanced search across patient records, medical history, and treatment patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle className="text-red-900">Secure & Compliant</CardTitle>
              <CardDescription>
                Role-based security, data encryption, and healthcare compliance with audit trails
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
            Join hundreds of healthcare professionals using our comprehensive clinic management system
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/login">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
