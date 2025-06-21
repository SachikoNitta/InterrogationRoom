"use client"
import type React from "react"
import { useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"

export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard")
      }
    })
    return () => unsubscribe()
  }, [router])

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
      console.error("Login error:", e)
    }
  }, [])

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
        <Button size="lg" className="h-16 text-xl" onClick={handleGoogleLogin}>
          Googleでログイン
        </Button>
      </div>
    </div>
  )
}