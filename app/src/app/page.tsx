"use client"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/auth"
import { Entrance } from "@/components/Entrance"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
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
