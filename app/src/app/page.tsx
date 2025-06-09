"use client"

import type React from "react"

import { Entrance } from "@/components/Entrance";
import { Office } from "@/components/Office";
import { Preferences }
 from "@/components/Preferences";
import { Chat } from "@/components/Chat";
import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";

// Mock data for past cases
const mockCases = [
	{
		id: 1,
		title: "Case #2024-001: Financial Fraud Investigation",
		date: "2024-01-15",
		time: "14:30",
		status: "Completed",
		messageCount: 45,
	},
	{
		id: 2,
		title: "Case #2024-002: Identity Theft Analysis",
		date: "2024-01-12",
		time: "09:15",
		status: "In Progress",
		messageCount: 23,
	},
	{
		id: 3,
		title: "Case #2024-003: Corporate Espionage Review",
		date: "2024-01-10",
		time: "16:45",
		status: "Completed",
		messageCount: 67,
	},
	{
		id: 4,
		title: "Case #2024-004: Cybersecurity Breach",
		date: "2024-01-08",
		time: "11:20",
		status: "Archived",
		messageCount: 89,
	},
]

type ViewType = "entrance" | "chat" | "office" | "preferences"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Page() {
	const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
	const messagesEndRef = useRef<HTMLDivElement>(null)
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
	const [cases, setCases] = useState<any[]>([]);

	// Fetch cases on component mount
	useEffect(() => {
		const fetchCases = async () => {
			const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
			const res = await fetch(`${apiBaseUrl}/api/users/dummy-user-id/cases`);
			if (res.ok) {
				const data = await res.json();
				setCases(data);
			}
		};
		fetchCases();
	}, []);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (input.trim() === "") return
		handleSubmit(e)
	}

	const handleStartCase = async () => {
		const userId = "dummy-user-id"
		let foundCaseId = null
		try {
			const res = await fetch(`${apiBaseUrl}/api/users/${userId}/cases`)
			if (res.ok) {
				const cases = await res.json()
				const inProgress = cases.find((c: any) => c.status === "in_progress")
				if (inProgress) {
					foundCaseId = inProgress.caseId
				}
			}
		} catch (e) {
			// ignore
		}
		if (!foundCaseId) {
			// 新規作成
			const res = await fetch(`${apiBaseUrl}/api/cases`, { method: "POST" })
			if (res.ok) {
				const newCase = await res.json()
				foundCaseId = newCase.id || newCase.caseId
			}
		}
		if (foundCaseId) setCaseId(foundCaseId)
		setPreviousView(currentView); // ここで直前の画面を記録
		setCurrentView("chat")
	}

	const handleGoToOffice = () => {
		setCurrentView("office")
	}

	const handlePreferencesClick = () => {
		setCurrentView("preferences")
	}

	const handleBackToEntrance = () => {
		setCurrentView("entrance")
	}

	const handleBackToOffice = () => {
		setCurrentView("office")
	}

	const handleBackFromChat = () => {
		setCurrentView(previousView);
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
		switch (currentView) {
			case "chat":
				return (
					<Chat
						messages={messages}
						input={input}
						handleInputChange={handleInputChange}
						onSubmit={onSubmit}
						isLoading={isLoading}
						messagesEndRef={messagesEndRef}
						onBackToEntrance={handleBackFromChat} // ここを変更
						caseId={caseId}
					/>
				)
			case "office":
				return (
					<Office
						onBackToEntrance={handleBackToEntrance}
						onPreferencesClick={handlePreferencesClick}
						onStartCase={handleStartCase}
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
			default:
				return <Entrance onStartCase={handleStartCase} onGoToOffice={handleGoToOffice} />
		}
	}

	return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">{renderCurrentView()}</div>
}
