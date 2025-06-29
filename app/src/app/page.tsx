"use client"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Page() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (!auth) {
      // If auth is not initialized (SSR), redirect to login
      router.replace("/login")
      return
    }
    
    if (!loading) {
      if (user) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, loading, router])

  return null
}
