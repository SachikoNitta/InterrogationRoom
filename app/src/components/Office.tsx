"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import React, { useEffect, useState } from "react"
import { auth } from "@/lib/auth"
import { signOut } from "firebase/auth"

interface OfficeProps {
  onBackToEntrance: () => void
  onClickCase: (caseId?: string) => void
  getStatusColor: (status: string) => string
}

export const Office: React.FC<OfficeProps> = ({
  onBackToEntrance,
  onClickCase,
  getStatusColor,
}) => {
  const [cases, setCases] = useState<any[]>([])

  // Caseデータを取得
  useEffect(() => {
    const fetchCases = async () => {
      const idToken = await auth.currentUser?.getIdToken()
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${apiBaseUrl}/api/cases`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        const data = await res.json()
        setCases(data)
      }
    }
    fetchCases()
  }, [])

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
