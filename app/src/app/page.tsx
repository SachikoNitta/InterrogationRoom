"use client"

import type React from "react"

import { Entrance } from "@/components/Entrance";
import { Office } from "@/components/Office";
import { Preferences }
	from "@/components/Preferences";
import { Chat } from "@/components/Chat";
import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";

type ViewType = "entrance" | "chat" | "office" | "preferences"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Page() {
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

	// Officeを表示するたびにケース一覧を取得
	useEffect(() => {
		if (currentView !== "office") return;
		const fetchCases = async () => {
			const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
			const res = await fetch(`${apiBaseUrl}/api/users/dummy-user-id/cases`);
			if (res.ok) {
				const data = await res.json();
				setCases(data);
			}
		};
		fetchCases();
	}, [currentView]);

	// Start a Caseをクリックしたときの処理
	const handleStartCase = async () => {
		setPreviousView(currentView);
		const res = await fetch(`${apiBaseUrl}/api/cases`, { method: "POST" })
		if (res.ok) {
			const newCase = await res.json()
			console.log("New case created:", newCase)
			setCaseId(newCase.caseId)
		}
		setCurrentView("chat")
	}

	// OfficeのCaseをクリックしたときの処理
	const handleClickCase = (caseId?: string) => {
		if (caseId) {
			setPreviousView(currentView);
			setCaseId(caseId)
			setCurrentView("chat")
		}
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
						onBackToEntrance={handleBackFromChat}
						caseId={caseId}
					/>
				)
			case "office":
				return (
					<Office
						onBackToEntrance={handleBackToEntrance}
						onPreferencesClick={handlePreferencesClick}
						onClickCase={handleClickCase}
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
