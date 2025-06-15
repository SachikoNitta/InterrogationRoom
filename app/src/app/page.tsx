"use client"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/auth"
import { Entrance } from "@/components/Entrance"
import { Office } from "@/components/Office"
import { Chat } from "@/components/Chat"
import { useState } from "react"

type ViewType = "entrance" | "chat" | "office" | "preferences" | "accountSettings"

export default function Page() {
  const [user, loading] = useAuthState(auth)
  // 現在のビュー
  const [currentView, setCurrentView] = useState<ViewType>("entrance")
  // 前のビュー
  const [previousView, setPreviousView] = useState<ViewType>("entrance")

  // Case ID state
  const [caseId, setCaseId] = useState<string | null>(null)

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

  const handleBackToEntrance = () => {
    setCurrentView("entrance")
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
            onClickCase={handleClickCase}
            getStatusColor={getStatusColor}
          />
        )
      default:
        return <Entrance onStartCase={handleStartCase} onGoToOffice={handleGoToOffice} />
    }
  }

  return <div className="h-screen w-screen bg-gray-50">{renderCurrentView()}</div>
}
