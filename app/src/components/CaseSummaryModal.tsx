import React, { useEffect, useRef, useState } from "react"
import { auth } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

interface CaseSummaryModalProps {
  caseId: string
  setShowSummary: (show: boolean) => void
}

export const CaseSummaryModal: React.FC<CaseSummaryModalProps> = ({
  caseId,
  setShowSummary,
}) => {
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  const isGenerating = useRef(false)

  // caseIdから事件の概要を取得
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setSummary("")

      try {
        // まずGETで概要取得
        const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}/summary`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${auth.currentUser ? await auth.currentUser.getIdToken() : ""}`,
            "Content-Type": "application/json",
          },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.summary && data.summary.trim() !== "") {
            setSummary(data.summary)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error("Error fetching case summary:", error)
      }

      // なければPOSTで生成（ストリーム受信）
      if (isGenerating.current) return
      isGenerating.current = true
      try {
        const postRes = await fetch(`${apiBaseUrl}/api/cases/${caseId}/summary`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        })
        if (!postRes.body) return
        const reader = postRes.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunk = decoder.decode(value)
            for (const char of chunk) {
              // 適宜調整可能な遅延.
              await new Promise((resolve) => setTimeout(resolve, 50))
              setSummary(prev => prev + char)
            }
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("Error generating case summary:", error)
      } finally {
        isGenerating.current = false
      }
    }
    fetchSummary()
  }, [caseId, apiBaseUrl])

  // モーダルを閉じる処理.
  const onClose = () => {
    setShowSummary(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">取り調べメモ</h2>
        <div className="mb-6 whitespace-pre-line text-gray-800 min-h-[4rem]">
          {loading && summary === "" ? (
            <Spinner size="large" />
          ) : (
            summary || "この事件の概要はまだありません。"
          )}
        </div>
      </div>
    </div>
  )
}