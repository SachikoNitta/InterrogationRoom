import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import React, { RefObject } from "react";

interface ChatProps {
  messages: { id: string; role: string; content: string }[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onBackToEntrance: () => void;
  caseId?: string | null; // 追加
}

export const Chat: React.FC<ChatProps> = ({ messages, input, handleInputChange, onSubmit, isLoading, messagesEndRef, onBackToEntrance }) => (
  <Card className="w-full max-w-4xl shadow-lg">
    <CardHeader className="border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBackToEntrance}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Interrogation Room</CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent className="h-[60vh] overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Send a message to start chatting with the AI</p>
        </div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </CardContent>
    <CardFooter className="border-t p-4">
      <form onSubmit={onSubmit} className="flex w-full space-x-2">
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
