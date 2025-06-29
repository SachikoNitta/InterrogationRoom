"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

const creditSections = [
  {
    title: "Engineer Friends",
    subtitle: "いつもインスピレーションをくれてありがとう",
    people: ["梅ち", "ハユセ", "緒方さん"],
  },
  {
    title: "Emotional Supporters",
    subtitle: "いつも癒してくれてありがとう",
    people: ["コロ", "ちゃーちゃん", "おばあちゃん"],
  },
]

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SpecialThanksPage() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl mx-auto bg-black border-0 shadow-none">
        <CardContent className="p-0">
          <div
            className={`text-center space-y-12 transition-all duration-1000 ease-out ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Main Title */}
            <div className="space-y-4 mb-16">
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide">SPECIAL THANKS</h1>
              <div className="w-32 h-px bg-white/30 mx-auto"></div>
            </div>

            {/* Credits Sections */}
            <div className="space-y-16">
              {creditSections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className={`space-y-6 transition-all duration-700 ease-out ${
                    showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${(sectionIndex + 1) * 400}ms` }}
                >
                  {/* Section Title */}
                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-light text-white/90 tracking-wider uppercase">
                      {section.title}
                    </h2>
                    <p className="text-sm text-white/60 font-light">{section.subtitle}</p>
                  </div>

                  {/* People List */}
                  <div className="space-y-3">
                    {section.people.map((person, personIndex) => (
                      <div
                        key={personIndex}
                        className={`transition-all duration-500 ease-out ${
                          showContent ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                        }`}
                        style={{
                          transitionDelay: `${(sectionIndex + 1) * 400 + (personIndex + 1) * 200}ms`,
                        }}
                      >
                        <p className="text-lg md:text-xl text-white font-light tracking-wide">{person}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Final Message */}
            <div
              className={`space-y-6 pt-16 transition-all duration-700 ease-out ${
                showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "2000ms" }}
            >
              <div className="w-48 h-px bg-white/20 mx-auto"></div>
              <p className="text-white/70 text-lg font-light italic tracking-wide">Interrogation Roomができたのはこの方達のおかげです</p>
              <p className="text-white/50 text-sm font-light tracking-widest uppercase">Thank you for everything</p>
            </div>

            {/* Copyright-style footer */}
            <div
              className={`pt-12 transition-all duration-700 ease-out ${showContent ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: "2500ms" }}
            >
              <p className="text-white/30 text-xs font-light tracking-widest uppercase">
                With love and gratitude • 2025 © Interrogation Room
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
