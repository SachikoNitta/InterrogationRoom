"use client"

import type React from "react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Building2 } from "lucide-react"
import { auth, signInWithGoogle } from "@/lib/auth"

interface EntranceProps {
  onStartCase: () => void
  onGoToOffice: () => void
}

export const Entrance: React.FC<EntranceProps> = ({ onStartCase, onGoToOffice }) => {
  const handleGoogleLogin = useCallback(async () => {
    try {
      const result = await signInWithGoogle()
      const user = result.user
      if (user) {
        const idToken = await user.getIdToken()
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) {
          throw new Error("API login failed")
        }
      }
    } catch (e) {
      alert("ログインに失敗しました")
    }
  }, [])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">Interrogation Room</h1>
      </div>
      <div className="flex flex-col space-y-6 w-80">
        {auth.currentUser ? (
          <>
            <Button size="lg" className="h-16 text-xl" onClick={onStartCase}>
              <MessageSquare className="mr-3 h-6 w-6" />
              Start a Case
            </Button>
            <Button size="lg" variant="outline" className="h-16 text-xl" onClick={onGoToOffice}>
              <Building2 className="mr-3 h-6 w-6" />
              Go to Office
            </Button>
          </>
        ) : (
          <Button size="lg" className="h-16 text-xl" onClick={handleGoogleLogin}>
            Googleでログイン
          </Button>
        )}
      </div>
    </div>
  )
}
