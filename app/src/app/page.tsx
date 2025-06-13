"use client"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/auth"

import { Entrance } from "@/components/Entrance"
import { Office } from "@/components/Office"
import { Preferences } from "@/components/Preferences"
import { Chat } from "@/components/Chat"
import { AccountSettings } from "@/components/AccountSettings"
import { useEffect, useState } from "react"

type ViewType = "entrance" | "chat" | "office" | "preferences" | "accountSettings"

export default function Page() {
  const [user, loading] = useAuthState(auth)
  const [currentView, setCurrentView] = useState<ViewType>("entrance")
  const [previousView, setPreviousView] = useState<ViewType>("entrance")

  // Case ID state
  const [caseId, setCaseId] = useState<string | null>(null)

  // Preference states
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("english")
  const [dataRetention, setDataRetention] = useState("30")

  // State to hold fetched cases
  const [cases, setCases] = useState<any[]>([])

  // Officeを表示するたびにケース一覧を取得
  useEffect(() => {
    if (currentView !== "office") return
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
  }, [currentView])

  // Start a Caseをクリックしたときの処理
  const handleStartCase = async () => {
    setPreviousView(currentView)
    setCaseId(null) // caseIdをリセット
    setCurrentView("chat")
  }

  // OfficeのCaseをクリックしたときの処理
  const handleClickCase = (caseId?: string) => {
    if (caseId) {
      setPreviousView(currentView)
      setCaseId(caseId)
      setCurrentView("chat")
    }
  }

  const handleGoToOffice = () => {
    setCurrentView("office")
  }

  const handlePreferencesClick = () => {
    setCurrentView("preferences")
  }

  const handleAccountSettingsClick = () => {
    setCurrentView("accountSettings")
  }

  const handleBackToEntrance = () => {
    setCurrentView("entrance")
  }

  const handleBackToOffice = () => {
    setCurrentView("office")
  }

  const handleBackFromChat = () => {
    setCurrentView(previousView)
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

  const renderCurrentView = () => {
    if (!user && !loading) {
      // 未ログイン時は必ずEntranceのみ表示
      return <Entrance onStartCase={handleStartCase} onGoToOffice={handleGoToOffice} />
    }
    switch (currentView) {
      case "chat":
        return <Chat onBackToEntrance={handleBackFromChat} caseId={caseId} setCaseId={setCaseId} />
      case "office":
        return (
          <Office
            onBackToEntrance={handleBackToEntrance}
            onPreferencesClick={handlePreferencesClick}
            onAccountSettingsClick={handleAccountSettingsClick}
            onClickCase={handleClickCase}
            cases={cases}
            getStatusColor={getStatusColor}
          />
        )
      case "preferences":
        return (
          <Preferences
            notifications={notifications}
            autoSave={autoSave}
            theme={theme}
            language={language}
            dataRetention={dataRetention}
            setNotifications={setNotifications}
            setAutoSave={setAutoSave}
            setTheme={setTheme}
            setLanguage={setLanguage}
            setDataRetention={setDataRetention}
            onBackToOffice={handleBackToOffice}
          />
        )
      case "accountSettings":
        return <AccountSettings onBackToOffice={handleBackToOffice} />
      default:
        return <Entrance onStartCase={handleStartCase} onGoToOffice={handleGoToOffice} />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">{renderCurrentView()}</div>
  )
}
