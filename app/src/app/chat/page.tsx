"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Trash2, StickyNote } from "lucide-react"
import { Drawer } from "@/components/ui/Drawer"
import { Spinner } from "@/components/ui/spinner"
import { Case, LogEntry } from "@/types/case"
import { auth } from "@/lib/auth"
import { Summary } from "@/types/summary"
import { SummaryDrawerContent } from "@/components/SummaryDrawerContent"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const summaryId = searchParams.get("summaryId") || ""
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const drawerWidth = 400

  // 事件の概要を取得
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true)
      setSummary(null)
      try {
        const user = auth.currentUser
        if (!user) {
          console.log("⏳ Waiting for Firebase user...")
          return // 🔁 ユーザー未取得時はreturn、次のレンダリングで再実行される
        }
        const idToken = await user.getIdToken()
        const res = await fetch(`${apiBaseUrl}/api/summaries/${summaryId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
        if (res.ok) {
          const data = await res.json()
          setSummary(data || "")
        }
      } catch (err) {
        console.error("❌ Failed to fetch summary", err)
        setSummary(null)
      } finally {
        setSummaryLoading(false)
      }
    }
  
    // ✅ 明示的に発火（ユーザーが取れたか確認）
    if (auth.currentUser) {
      fetchSummary()
    } else {
      const unsubscribe = auth.onAuthStateChanged(() => {
        fetchSummary()
        unsubscribe() // 初回だけ
      })
    }
  }, [apiBaseUrl, summaryId])

  // Caseをセット.
  useEffect(() => {
    const fetchOrCreateCase = async () => {
      if (!summaryId) return
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        notFound()
      }
      // まずGETで既存ケースを取得
      let res = await fetch(`${apiBaseUrl}/api/cases/summary/${summaryId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      })
      let data = null
      if (res.ok) {
        data = await res.json()
      } else {
        // なければPOSTで新規作成
        console.log("Case not found, creating new case")
        res = await fetch(`${apiBaseUrl}/api/cases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summaryId }),
        })
        if (res.ok) {
          data = await res.json()
        }
      }
      if (data) {
        setCaseData(data)
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
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
    }
    fetchOrCreateCase()
  }, [summaryId, apiBaseUrl, messages.length])

  // メッセージが更新されたときにスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 入力フィールドの変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // メッセージの送信時の処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((prev) => [...prev, { role: "user", content: input }, { role: "model", content: "" }])
    setInput("")
    setIsLoading(true)
    const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        notFound()
      }
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseData?.caseId}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
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

  // ケースの削除処理
  const handleDeleteCase = async () => {
    if (!caseData?.caseId) return
    if (!window.confirm("本当にこのケースを削除しますか？")) return
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseData?.caseId}`, { method: "DELETE" })
    if (res.ok) {
      alert("ケースを削除しました")
      router.push("/")
    } else {
      alert("削除に失敗しました")
    }
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white relative">
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={drawerOpen ? { width: `calc(100vw - ${drawerWidth}px)`, marginRight: `${drawerWidth}px` } : { width: "100vw" }}
      >
        {/* ヘッダー固定 */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}> {/* 戻る */}
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">{summary ? summary.summaryName : ''}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDeleteCase} title="Delete Case">
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
        {/* メッセージ表示エリア（中央のみスクロール） */}
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
        {/* 入力エリア固定 */}
        <div className="sticky bottom-0 z-10 border-t p-6 bg-white flex items-center justify-between">
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
          <SummaryDrawerContent summary={summary} summaryLoading={summaryLoading} />
        </div>
      </Drawer>
    </div>
  )
}
