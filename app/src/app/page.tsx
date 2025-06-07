"use client"

import type React from "react"

import { useChat } from "ai/react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, ArrowLeft, Calendar, Clock, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  FileText,
  Settings,
  Bell,
  Palette,
  Shield,
  Database,
  MessageSquare,
  Coins,
  Mail,
  Phone,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Mock data for past cases
const mockCases = [
  {
    id: 1,
    title: "Case #2024-001: Financial Fraud Investigation",
    date: "2024-01-15",
    time: "14:30",
    status: "Completed",
    messageCount: 45,
  },
  {
    id: 2,
    title: "Case #2024-002: Identity Theft Analysis",
    date: "2024-01-12",
    time: "09:15",
    status: "In Progress",
    messageCount: 23,
  },
  {
    id: 3,
    title: "Case #2024-003: Corporate Espionage Review",
    date: "2024-01-10",
    time: "16:45",
    status: "Completed",
    messageCount: 67,
  },
  {
    id: 4,
    title: "Case #2024-004: Cybersecurity Breach",
    date: "2024-01-08",
    time: "11:20",
    status: "Archived",
    messageCount: 89,
  },
]

type ViewType = "entrance" | "chat" | "office" | "preferences"

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentView, setCurrentView] = useState<ViewType>("entrance")

  // Preference states
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("english")
  const [dataRetention, setDataRetention] = useState("30")

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "") return
    handleSubmit(e)
  }

  const handleStartCase = () => {
    setCurrentView("chat")
  }

  const handleGoToOffice = () => {
    setCurrentView("office")
  }

  const handlePreferencesClick = () => {
    setCurrentView("preferences")
  }

  const handleBackToEntrance = () => {
    setCurrentView("entrance")
  }

  const handleBackToOffice = () => {
    setCurrentView("office")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderEntrance = () => (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="text-center py-12">
        <CardTitle className="text-4xl font-bold text-gray-800 mb-8">Interrogation Room</CardTitle>
      </CardHeader>
      <CardContent className="px-12 pb-12">
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          <Button size="lg" className="h-14 text-lg" onClick={handleStartCase}>
            <MessageSquare className="mr-3 h-5 w-5" />
            Start a Case
          </Button>
          <Button size="lg" variant="outline" className="h-14 text-lg" onClick={handleGoToOffice}>
            <Building2 className="mr-3 h-5 w-5" />
            Go to Office
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderOffice = () => (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackToEntrance}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Office</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Detective Smith" />
              <AvatarFallback className="text-lg">DS</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Detective Sarah Smith</h2>
              <p className="text-gray-600">Senior Investigator</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>s.smith@department.gov</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Tokens Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">AI Tokens</h3>
            </div>
            <Button variant="outline" size="sm">
              Purchase More
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-blue-600">Available Tokens</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,153</div>
              <div className="text-sm text-green-600">Used This Month</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">5,000</div>
              <div className="text-sm text-orange-600">Monthly Limit</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="flex space-x-3">
            <Button onClick={handlePreferencesClick}>
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Button>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <Separator />

        {/* Past Cases Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Cases</h3>
            <Badge variant="secondary">{mockCases.length} Total Cases</Badge>
          </div>
          <div className="space-y-3">
            {mockCases.map((case_) => (
              <div
                key={case_.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={handleStartCase}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{case_.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{case_.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{case_.time}</span>
                      </div>
                      <span>{case_.messageCount} messages</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                    {case_.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPreferences = () => (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackToOffice}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Preferences</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-gray-500">Receive alerts for new messages and case updates</p>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto-save Cases</Label>
                <p className="text-sm text-gray-500">Automatically save case progress every 5 minutes</p>
              </div>
              <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Appearance Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Appearance</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security & Privacy Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Security & Privacy</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention Period</Label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">How long to keep case data before automatic deletion</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Management Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Data Management</h3>
          </div>
          <div className="space-y-3 pl-7">
            <div className="flex space-x-3">
              <Button variant="outline">Export All Cases</Button>
              <Button variant="outline">Clear Cache</Button>
              <Button variant="destructive">Delete All Data</Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-6">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleBackToOffice}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </div>
      </CardFooter>
    </Card>
  )

  const renderChat = () => (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleBackToEntrance}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Interrogation Room</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Send a message to start chatting with the AI</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={onSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || input.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )

  const renderCurrentView = () => {
    switch (currentView) {
      case "chat":
        return renderChat()
      case "office":
        return renderOffice()
      case "preferences":
        return renderPreferences()
      default:
        return renderEntrance()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">{renderCurrentView()}</div>
  )
}
