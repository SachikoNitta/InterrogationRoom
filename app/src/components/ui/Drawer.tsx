import React from "react"

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, children, width = "400px" }) => {
  return (
    <div>
      {/* ドロワー本体のみ。オーバーレイは表示しない */}
      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 transition-transform duration-300 z-50 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ width, pointerEvents: open ? "auto" : "none" }}
      >
        <div className="h-full overflow-y-auto p-8 pt-12">{children}</div>
      </div>
    </div>
  )
}
