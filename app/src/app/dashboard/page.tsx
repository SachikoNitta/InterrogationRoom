"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Play, Star, LogOut } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/auth"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const [summaries, setSummaries] = useState<any[]>([])
  const [cases, setCases] = useState<Record<string, any>>({})
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const [user] = useAuthState(auth)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/")
  }

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        if (!user) return
        const idToken = await user.getIdToken()
        const res = await fetch(`${apiBaseUrl}/api/summaries`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch summaries")
        const data = await res.json()
        setSummaries(data)
      } catch (e) {
        setSummaries([])
      }
    }
    fetchSummaries()
  }, [apiBaseUrl, user])

  useEffect(() => {
    const fetchCases = async () => {
      try {
        if (!user) return
        const idToken = await user.getIdToken()
        const res = await fetch(`${apiBaseUrl}/api/cases`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch cases")
        const data = await res.json()
        // 配列→summaryIdをキーにしたオブジェクトへ変換
        const casesBySummaryId = data.reduce((acc: Record<string, any>, c: any) => {
          acc[c.summaryId] = c
          return acc
        }, {})
        console.log("Fetched cases:", casesBySummaryId)
        setCases(casesBySummaryId)
      } catch (e) {
        setCases({})
      }
    }
    fetchCases()
  }, [apiBaseUrl, user])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Interrogatioin Room</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome,</span>
                <span className="font-medium">{user?.displayName || "User"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">未解決事件リスト</h2>
          <p className="text-muted-foreground">取り調べを行いたい事件を選択してください。</p>
        </div>

        {/* Summary Count Badge */}
        <div className="mb-4 flex items-center space-x-2">
          <Badge variant="secondary">{summaries.length} Available</Badge>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => (
            <Card
              key={summary.summaryId}
              className="transition-all duration-200 hover:shadow-lg hover:shadow-md cursor-pointer"
              onClick={() => {
              router.push(`/chat?summaryId=${summary.summaryId}`)
              }}
            >
              <div className="relative">
                <Image
                  src={summary.image || "/placeholder.svg"}
                  alt={summary.summaryName || ""}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {summary.genre && (
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white" variant="secondary">
                    {summary.genre}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{summary.summaryName}</CardTitle>
                  {summary.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{summary.rating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-4 line-clamp-3">
                  {summary.overview}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
