"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Trash2, StickyNote, Bot } from "lucide-react"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { CaseSummaryModal } from "./CaseSummaryModal"
import { AssistantModal } from "@/components/AssistantModal"
import { CaseDto, LogEntryDto } from "@/types/case"

interface ChatProps {
  onBackToEntrance: () => void
  caseId: string
}

export const Chat: React.FC<ChatProps> = ({ caseId, onBackToEntrance }) => {
  // DBから取得したCaseデータ.
  const [caseData, setCaseData] = useState<CaseDto | null>(null)
  // 画面上に表示される全てのメッセージ.
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("") // 入力フィールドの状態
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [assistantModalOpen, setAssistantModalOpen] = useState(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  // Caseデータを取得
  useEffect(() => {
    // APIからデータを取得
    const fetchCase = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`)
        if (res.ok) {
          const data = await res.json()
          setCaseData(data)
          // logsをmessages stateにセット（既にmessagesが存在する場合は上書きしない）
          if (data.logs && Array.isArray(data.logs)) {
            if (messages.length === 0) {
              setMessages(
                data.logs.map((log: LogEntryDto) => ({
                  role: log.role,
                  content: log.message,
                })),
              )
            }
          } else {
            if (messages.length === 0) {
              setMessages([])
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch case data:", e)
      }
    }
    fetchCase()
  }, [caseId, apiBaseUrl, messages.length])

  // メッセージが更新されたときにスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 入力フィールドの変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // メッセージの送信時の処理.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // ユーザーのメッセージとAI返答用の空要素を同時に追加
    setMessages((prev) => [...prev, { role: "user", content: input }, { role: "model", content: "" }])
    setInput("")
    setIsLoading(true)

    // APIにメッセージを送信.
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })

    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (!value) continue

      const chunk = decoder.decode(value)

      for (const char of chunk) {
        // 適宜調整可能な遅延.
        await new Promise((resolve) => setTimeout(resolve, 50))
        // 1文字ずつ末尾に追加.
        setMessages((prev) => {
          const updated = [...prev]
          if (updated.length === 0) {
            updated.push({ role: "user", content: input })
            updated.push({ role: "model", content: char })
          } else {
            // 最後の要素に文字を追加
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + char,
            }
          }
          return updated
        })
      }
    }

    // 入力不可を解除.
    setIsLoading(false)
  }

  // ケース削除処理
  const handleDeleteCase = async () => {
    if (!caseId) return
    if (!window.confirm("本当にこのケースを削除しますか？")) return
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`, { method: "DELETE" })
    if (res.ok) {
      alert("ケースを削除しました")
      onBackToEntrance()
    } else {
      alert("削除に失敗しました")
    }
  }

  useEffect(() => {
    if (caseData && (!caseData.summary || caseData.summary === "")) {
      setShowSummary(true)
    }
  }, [caseData])

  // アシスタントボタンのクリック処理
  const handleAssistant = () => {
    setAssistantModalOpen(true)
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBackToEntrance}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Interrogation Room</h1>
          {caseData && (
            <span className="ml-4 text-sm text-gray-500">
              Case: {caseData.caseId} / Status: {caseData.status}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDeleteCase} title="Delete Case">
          <Trash2 className="h-5 w-5 text-red-500" />
        </Button>
      </div>
      {/* モーダル */}
      {showSummary && (
        <CaseSummaryModal
          caseId={caseId}
          setShowSummary={setShowSummary}
        />
      )}
      {/* アシスタントモーダル */}
      {assistantModalOpen && (
        <AssistantModal
          caseId={caseId}
          setAssistantModalOpen={setAssistantModalOpen}
        />
      )}
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Send a message to start chatting with the AI</p>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${m.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  dangerouslySetInnerHTML={{
                    __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="border-t p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2 items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || input.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
          {/* アシスタントボタン */}
          <Button
            type="button"
            disabled={isLoading || messages.length === 0}
            onClick={handleAssistant}
            title="アシスタントに質問"
          >
            <Bot className="h-4 w-4" />
          </Button>
          {/* メモアイコンボタンなど... */}
          <Button type="button" onClick={() => setShowSummary(true)} disabled={isLoading} title="Show Case Summary">
            <StickyNote className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
