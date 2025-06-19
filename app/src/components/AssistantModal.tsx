import React, { useEffect, useState, useRef } from "react"
import { Bot } from "lucide-react"

interface AssistantModalProps {
  caseId: string
  setAssistantModalOpen: (open: boolean) => void
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ caseId, setAssistantModalOpen }) => {
  const [text, setText] = useState("")
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  const fetchAssistantRef = useRef(false)

  const onClose = () => {
    setAssistantModalOpen(false)
  }

  useEffect(() => {
    let ignore = false
    const hasFetched = fetchAssistantRef.current
    if (hasFetched) return
    fetchAssistantRef.current = true

    const fetchAssistant = async () => {
      if (ignore) {
        return
      }
      const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}/assistance`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value)
          for (const char of chunk) {
            await new Promise((resolve) => setTimeout(resolve, 50))
            setText(prev => (prev + char))
          }
        }
      }
    }
    fetchAssistant()

    return () => { ignore = true }
  }, [caseId, apiBaseUrl])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="flex items-center mb-4">
          <Bot className="h-6 w-6 mr-2 text-blue-500" />
          <h2 className="text-2xl font-bold">アシスタント</h2>
        </div>
        <div className="mb-6 whitespace-pre-line text-gray-800 min-h-[4rem]">
          {text === "" ? "生成中..." : text}
        </div>
      </div>
    </div>
  )
}
