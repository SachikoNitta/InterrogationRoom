"use client"
import type React from "react"
import { useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { user, signIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  const handleGoogleLogin = useCallback(async () => {
    try {
      await signIn()
      // Call the API login endpoint to register/login the user
      const token = await user?.getIdToken()
      if (token) {
        const res = await fetch(`/api/auth/login`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) {
          throw new Error("API login failed")
        }
      }
    } catch (e) {
      alert("ログインに失敗しました")
      console.error("Login error:", e)
    }
  }, [signIn, user])

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center bg-gray-50"
      style={{
        backgroundImage: 'url(/images/tree.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-gray-800 mb-8">Interrogation Room</h1>
      </div>
      <div className="flex flex-col space-y-6 w-80">
        <Button 
          size="lg" 
          className="h-16 text-xl" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'Googleでログイン'}
        </Button>
      </div>
    </div>
  )
}