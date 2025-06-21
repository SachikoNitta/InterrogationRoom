"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Trash2, StickyNote } from "lucide-react"
import { Drawer } from "@/components/ui/Drawer"
import { Spinner } from "@/components/ui/spinner"
import { Case, LogEntry } from "@/types/case"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const summaryId = searchParams.get("summaryId") || ""
  if (!summaryId) {
    notFound()
  }
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [summary, setSummary] = useState<string>("")
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const drawerWidth = 400

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`)
        if (res.ok) {
          const data = await res.json()
          setCaseData(data)
          if (data.logs && Array.isArray(data.logs)) {
            if (messages.length === 0) {
              setMessages(
                data.logs.map((log: LogEntry) => ({
                  role: log.role,
                  content: log.message,
                }))
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
    if (caseId) fetchCase()
  }, [caseId, apiBaseUrl, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: input }, { role: "model", content: "" }])
    setInput("")
    setIsLoading(true)
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
        await new Promise((resolve) => setTimeout(resolve, 50))
        setMessages((prev) => {
          const updated = [...prev]
          if (updated.length === 0) {
            updated.push({ role: "user", content: input })
            updated.push({ role: "model", content: char })
          } else {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + char,
            }
          }
          return updated
        })
      }
    }
    setIsLoading(false)
  }

  const handleDeleteCase = async () => {
    if (!caseId) return
    if (!window.confirm("本当にこのケースを削除しますか？")) return
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`, { method: "DELETE" })
    if (res.ok) {
      alert("ケースを削除しました")
      router.push("/")
    } else {
      alert("削除に失敗しました")
    }
  }

  useEffect(() => {
    if (!drawerOpen) return
    const fetchSummary = async () => {
      setSummaryLoading(true)
      setSummary("")
      try {
        const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}/summary`)
        if (res.ok) {
          const data = await res.json()
          setSummary(data.summary || "")
        } else {
          setSummary("")
        }
      } catch {
        setSummary("")
      }
      setSummaryLoading(false)
    }
    fetchSummary()
  }, [drawerOpen, caseId, apiBaseUrl])

  return (
    <div className="h-full w-full flex flex-col bg-white relative">
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={drawerOpen ? { width: `calc(100vw - ${drawerWidth}px)`, marginRight: `${drawerWidth}px` } : { width: "100vw" }}
      >
        <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}> {/* 戻る */}
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">取り調べ室</h1>
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
                        ? "bg-black text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                  >
                    {m.role === "model" && m.content === "" ? (
                      <Spinner size={24} />
                    ) : (
                      <span dangerouslySetInnerHTML={{
                        __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />"),
                      }} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <div className="border-t p-6 bg-white flex items-center justify-between">
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
            <Button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              title="事件の概要を表示/非表示"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width={`${drawerWidth}px`} hideCloseButton>
        <h2 className="text-2xl font-bold mb-4">取り調べメモ</h2>
        <div className="mb-6 whitespace-pre-line text-gray-800 min-h-[4rem]">
          {summaryLoading ? <Spinner size={32} /> : (summary || "この事件の概要はまだありません。")}
        </div>
      </Drawer>
    </div>
  )
}
