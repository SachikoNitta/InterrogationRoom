"use client"
import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Trash2, StickyNote } from "lucide-react"
import { Drawer } from "@/components/ui/Drawer"
import { Spinner } from "@/components/ui/spinner"
import { Case, LogEntry } from "@/types/case"
import { auth, waitForIdToken } from "@/lib/auth"
import { Summary } from "@/types/summary"
import { SummaryDrawerContent } from "@/components/SummaryDrawerContent"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function ChatPageContent() {
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
  const [recipient, setRecipient] = useState<"suspect" | "assistant">("suspect")
  const [isTypewriting, setIsTypewriting] = useState(false)

  const drawerWidth = 400

  // 事件の概要を取得
  useEffect(() => {

    // 概要をフェッチ.
    const fetchSummary = async () => {
      // 概要をロード中にする.
      setSummaryLoading(true)

      // 概要をリセット.
      setSummary(null)

      // 概要を取得する.
      try {
        const idToken = await waitForIdToken()
        if (!idToken) {
          console.error("❌ No ID token found, redirecting to not found")
          notFound()
        }
        const res = await fetch(`/api/summaries/${summaryId}`, {
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
        // 概要のロードを終了.
        setSummaryLoading(false)
      }
    }
  
    // ✅ 明示的に発火（ユーザーが取れたか確認）
    // いらない？
    if (auth && auth.currentUser) {
      fetchSummary()
    } else if (auth) {
      const unsubscribe = auth.onAuthStateChanged(() => {
        fetchSummary()
        unsubscribe() // 初回だけ
      })
    }
    
  }, [summaryId])

  // リロード時にメッセージを更新するために必要？
  useEffect(() => {
    console.log("✅ useEffect called - summaryId:", summaryId)
  }, [summaryId])

  // Caseをセット.
  useEffect(() => {
    const fetchOrCreateCase = async () => {
      // 概要がセットされていない場合は何もしない.
      if (!summaryId) return

      // ユーザー情報が取得できない場合は何もしない.
      const idToken = await waitForIdToken()
      if (!idToken) {
        console.error("❌ No ID token found, redirecting to not found")
        notFound()
      }

      // 既存Caseを取得
      const fetchCase = async () => {
        return await fetch(`/api/cases/summary/${summaryId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        })
      }

      // Caseを新規作成
      const createCase = async () => {
        console.log("Case not found, creating new case")
        return await fetch(`/api/cases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ summaryId }),
        })
      }

      // Caseを取得もしくは新規作成.
      const getCaseData = async () => {
        let data = null
        let res = null

        res = await fetchCase()
        if (!res.ok) {
          res = await createCase()
        }

        if (res.ok) {
          data = await res.json()
        }

        // Caseをセット.
        if (data) {
          setCaseData(data)
        }

      }      
      await getCaseData()
      // setMessagesはここで呼ばない

    }
    fetchOrCreateCase()
  }, [summaryId])

  // recipientまたはcaseDataが変わったときにmessagesを切り替える
  useEffect(() => {
    // Caseがない場合は何もしない.
    if (!caseData) {
      setMessages([])
      return
    }

    // 新米刑事の場合.
    if (recipient === "assistant" && Array.isArray((caseData as any).assistantLogs)) {
      setMessages(
        (caseData as Case).assistantLogs.map((log: LogEntry) => ({
          role: log.role,
          content: log.message,
        }))
      )
    // 容疑者の場合.
    } else if (recipient === "suspect" && Array.isArray(caseData.logs)) {
      setMessages(
        caseData.logs.map((log: LogEntry) => ({
          role: log.role,
          content: log.message,
        }))
      )
    } else {
      setMessages([])
    }
  }, [recipient, caseData])

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
    
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }, { role: "model", content: "" }])
    setInput("")
    setIsLoading(true)
    
    try {
      const idToken = await waitForIdToken()
      if (!idToken) {
        notFound()
        return
      }

      // 送信先によってエンドポイントを切り替え
      const geEndpoint = () => {
        if (recipient === "assistant") {
          return `/api/cases/${caseData?.caseId}/chat/assistant`
        }
        return `/api/cases/${caseData?.caseId}/chat`
      }
      const endpoint = geEndpoint()

      // チャットを送信
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, recipient }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      if (!res.body) {
        throw new Error('No response body')
      }

      // ストリーミングレスポンスを処理（リアルタイム + タイプライター効果）
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let displayedText = ""
      const typewriterDelay = 30 // ミリ秒 (調整可能: 15=高速, 30=通常, 50=ゆっくり)
      
      setIsTypewriting(true)

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (!value) continue
        
        const chunk = decoder.decode(value).replace(/\n/g, ' ')
        console.log("Received chunk:", chunk)
        
        // チャンクの各文字を一文字ずつタイプライター効果で表示
        for (let i = 0; i < chunk.length; i++) {
          displayedText += chunk[i]
          
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: displayedText,
            }
            return updated
          })
          
          // 最後の文字でない場合のみ待機
          if (i < chunk.length - 1 || !done) {
            await new Promise(resolve => setTimeout(resolve, typewriterDelay))
          }
        }
      }

      setIsTypewriting(false)
    
      // メッセージ送信完了後にcaseDataを更新
      if (caseData && displayedText) {
        const userLogEntry: LogEntry = { role: "user", message: userMessage }
        const aiLogEntry: LogEntry = { role: "model", message: displayedText }
        
        setCaseData((prevCaseData) => {
          if (!prevCaseData) return prevCaseData
          
          const updatedCaseData = { ...prevCaseData }
          
          if (recipient === "assistant") {
            // 新米刑事の場合はassistantLogsに追加
            updatedCaseData.assistantLogs = [...(prevCaseData.assistantLogs || []), userLogEntry, aiLogEntry]
          } else {
            // 容疑者の場合はlogsに追加
            updatedCaseData.logs = [...(prevCaseData.logs || []), userLogEntry, aiLogEntry]
          }
          
          return updatedCaseData
        })
      }
    } catch (error) {
      console.error("チャット送信エラー:", error)
      const errorMessage = "エラーが発生しました。もう一度お試しください。"
      
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: errorMessage,
        }
        return updated
      })
      
      // エラーの場合もcaseDataを更新（エラーメッセージとして）
      if (caseData) {
        const userLogEntry: LogEntry = { role: "user", message: userMessage }
        const errorLogEntry: LogEntry = { role: "model", message: errorMessage }
        
        setCaseData((prevCaseData) => {
          if (!prevCaseData) return prevCaseData
          
          const updatedCaseData = { ...prevCaseData }
          
          if (recipient === "assistant") {
            updatedCaseData.assistantLogs = [...(prevCaseData.assistantLogs || []), userLogEntry, errorLogEntry]
          } else {
            updatedCaseData.logs = [...(prevCaseData.logs || []), userLogEntry, errorLogEntry]
          }
          
          return updatedCaseData
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ケースの削除処理
  const handleDeleteCase = async () => {
    if (!caseData?.caseId) return
    if (!window.confirm("取り調べデータを削除しますか？すべての会話履歴は削除されます。")) return

    try {
      // ユーザーが取得できない場合は何もしない.
      const idToken = await waitForIdToken()
      if (!idToken) {
        notFound()
        return
      }

      // 削除リクエストを送信.
      const res = await fetch(`/api/cases/${caseData?.caseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        alert("取り調べデータを削除しました。")
        router.push("/")
      } else {
        alert("取り調べデータの削除に失敗しました。")
      }
    } catch (error) {
      console.error("削除エラー:", error)
      alert("取り調べデータの削除に失敗しました。")
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
                      <Spinner size="small" />
                    ) : (
                      <div className="relative">
                        <span dangerouslySetInnerHTML={{
                          __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br />"),
                        }} />
                        {m.role === "model" && isTypewriting && i === messages.length - 1 && (
                          <span className="inline-block w-2 h-5 bg-gray-600 ml-1 animate-pulse">|</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        {/* 入力エリア固定 */}
        <div className="sticky bottom-0 z-10 border-t p-6 bg-white flex flex-col items-stretch">
          {/* 送信先切り替えボタン */}
          <div className="flex mb-2 gap-2 self-end justify-end">
            <Button
              type="button"
              variant={recipient === "suspect" ? "default" : "outline"}
              onClick={() => setRecipient("suspect")}
              size="sm"
              disabled={isLoading || isTypewriting}
            >
              容疑者
            </Button>
            <Button
              type="button"
              variant={recipient === "assistant" ? "default" : "outline"}
              onClick={() => setRecipient("assistant")}
              size="sm"
              disabled={isLoading || isTypewriting}
            >
              新米刑事
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2 items-center">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={isTypewriting ? "AIが回答中..." : "Type your message..."}
              className="flex-grow"
              disabled={isLoading || isTypewriting}
            />
            <Button type="submit" disabled={isLoading || isTypewriting || input.trim() === ""}>
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
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} width={`${drawerWidth}px`}>
        <h2 className="text-2xl font-bold mb-4">捜査資料</h2>
        <div className="mb-6 whitespace-pre-line text-gray-800 min-h-[4rem]">
          <SummaryDrawerContent summary={summary} summaryLoading={summaryLoading} />
        </div>
      </Drawer>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="large" /></div>}>
      <ChatPageContent />
    </Suspense>
  )
}
