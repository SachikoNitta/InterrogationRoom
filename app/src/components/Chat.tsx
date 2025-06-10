import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Trash2 } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

interface ChatProps {
  onBackToEntrance: () => void;
  caseId?: string | null;
  setCaseId: (caseId: string | null) => void;
}

export const Chat: React.FC<ChatProps> = ({ onBackToEntrance, caseId, setCaseId }) => {
  // DBから取得したCaseデータ.
  const [caseData, setCaseData] = useState<any>(null);
  // 画面上に表示される全てのメッセージ.
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(""); // 入力フィールドの状態
  const [isLoading, setIsLoading] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Caseデータを取得
  useEffect(() => {
    if (!caseId) return;
    const fetchCase = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
          // logsをmessages stateにセット
          if (data.logs && Array.isArray(data.logs)) {
            setMessages(
              data.logs.map((log: any) => ({
                role: log.role,
                content: log.message
              }))
            );
          } else {
            setMessages([]);
          }
        }
      } catch (e) {
        // エラー時は何もしない
      }
    };
    fetchCase();
  }, [caseId, apiBaseUrl]);

  // メッセージが更新されたときにスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 入力フィールドの変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // メッセージの送信時の処理.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    let usedCaseId = caseId;
    // caseIdがなければ新規作成
    if (!usedCaseId) {
      const res = await fetch(`${apiBaseUrl}/api/cases`, { method: "POST" });
      if (res.ok) {
        const newCase = await res.json();
        usedCaseId = newCase.caseId || newCase.id;
        setCaseId(usedCaseId || null);
      } else {
        alert("ケースの作成に失敗しました");
        setIsLoading(false);
        return;
      }
    }

    // ユーザーのメッセージとAI返答用の空要素を同時に追加
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "model", content: "" }
    ]);
    setInput("");
    setIsLoading(true);

    // APIにメッセージを送信.
    const res = await fetch(`${apiBaseUrl}/api/cases/${usedCaseId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (!value) continue;

      const chunk = decoder.decode(value);

      for (const char of chunk) {
        // 適宜調整可能な遅延.
        await new Promise(resolve => setTimeout(resolve, 50));
        // 1文字ずつ末尾に追加.
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length === 0) {
            updated.push({ role: "user", content: input });
            updated.push({ role: "model", content: char });
          } else {
            // 最後の要素に文字を追加
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + char
            };
          }
          return updated;
        });
      }
    }

    // 入力不可を解除.
    setIsLoading(false);
  };

  // ケース削除処理
  const handleDeleteCase = async () => {
    if (!caseId) return;
    if (!window.confirm("本当にこのケースを削除しますか？")) return;
    const res = await fetch(`${apiBaseUrl}/api/cases/${caseId}`, { method: "DELETE" });
    if (res.ok) {
      alert("ケースを削除しました");
      onBackToEntrance();
    } else {
      alert("削除に失敗しました");
    }
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBackToEntrance}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Interrogation Room</CardTitle>
            {caseData && (
              <span className="ml-4 text-sm text-gray-500">Case: {caseData.caseId} / Status: {caseData.status}</span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleDeleteCase} title="Delete Case">
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto p-4">
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
                    __html: m.content
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // **太字** → <strong>太字</strong>
                      .replace(/\n/g, "<br />") // 改行も同時に変換
                  }}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
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
        </form>
      </CardFooter>
    </Card>
  );
};
