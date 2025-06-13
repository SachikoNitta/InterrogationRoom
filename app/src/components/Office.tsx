"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Mail, Phone, Coins, Settings, User, FileText, Calendar, Clock, Shield } from "lucide-react"
import type React from "react"
import { auth } from "@/lib/auth"
import { signOut } from "firebase/auth"

interface OfficeProps {
  onBackToEntrance: () => void
  onPreferencesClick: () => void
  onAccountSettingsClick: () => void
  onClickCase: (caseId?: string) => void
  cases: any[]
  getStatusColor: (status: string) => string
}

export const Office: React.FC<OfficeProps> = ({
  onBackToEntrance,
  onPreferencesClick,
  onAccountSettingsClick,
  onClickCase,
  cases,
  getStatusColor,
}) => {
  // lastUpdatedAtで降順ソート
  const sortedCases = [...cases].sort((a, b) => {
    if (!a.lastUpdated || !b.lastUpdated) return 0
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  })

  const handleSignOut = async () => {
    await signOut(auth)
    onBackToEntrance()
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBackToEntrance}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Office</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Police ID Card Profile Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
          {/* ID Card Header */}
          <div className="bg-gray-900 text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-bold uppercase tracking-wider">Metropolitan Police Department</h3>
            </div>
            <div className="text-sm font-mono bg-gray-700 px-2 py-1 rounded">ID: 45892</div>
          </div>

          {/* ID Card Content */}
          <div className="p-4 bg-white">
            <div className="flex flex-col md:flex-row">
              {/* Photo Section */}
              <div className="md:mr-6 mb-4 md:mb-0 flex flex-col items-center">
                <div className="border border-gray-300 p-1 bg-gray-50">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Detective Smith" />
                    <AvatarFallback className="text-3xl bg-gray-200">DS</AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-600">ISSUED: 05/12/2023</div>
                  <div className="text-xs text-gray-600">EXPIRES: Never</div>
                </div>
              </div>

              {/* Details Section */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Name</div>
                    <div className="font-semibold text-lg">Sarah Smith</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Rank</div>
                    <div className="font-semibold">Detective</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Division</div>
                    <div className="font-semibold">Homicide</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Badge No.</div>
                    <div className="font-semibold">#7392</div>
                  </div>
                </div>

                {/* Signature */}
                <div className="mt-4 pt-2 border-t border-gray-200">
                  <div className="italic font-serif text-lg text-gray-700">Sarah Smith</div>
                  <div className="text-xs text-gray-500">AUTHORIZED SIGNATURE</div>
                </div>
              </div>
            </div>
          </div>

          {/* ID Card Footer */}
          <div className="bg-gray-900 text-white p-2 text-xs text-center">
            This ID remains the property of the Metropolitan Police Department. If found, please return to MPD
            Headquarters.
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
            <Button onClick={onPreferencesClick}>
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Button>
            <Button onClick={onAccountSettingsClick}>
              <User className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
          </div>
        </div>
        <Separator />
        {/* Past Cases Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Cases</h3>
            <Badge variant="secondary">{cases.length} Total Cases</Badge>
          </div>
          <div className="space-y-3">
            {sortedCases.map((case_) => (
              <div
                key={case_.caseId}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onClickCase(case_.caseId)} // caseIdを渡す
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{case_.caseId}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{case_.createdAt ? case_.createdAt.split("T")[0] : ""}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{case_.createdAt ? case_.createdAt.split("T")[1].slice(0, 5) : ""}</span>
                      </div>
                      <span>{case_.logs.length} messages</span>
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
}
