"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, Lock, Shield, Trash2, BadgeCheck, Building } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface AccountSettingsProps {
  onBackToOffice: () => void
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onBackToOffice }) => {
  const [name, setName] = useState("Sarah Smith")
  const [department, setDepartment] = useState("Metropolitan Police Department")
  const [division, setDivision] = useState("Homicide")
  const [rank, setRank] = useState("Detective")

  const handleSaveChanges = () => {
    // Here you would implement the logic to save the changes
    alert("Changes saved successfully!")
    onBackToOffice()
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Here you would implement the logic to delete the account
      alert("Account deleted successfully.")
      onBackToOffice()
    }
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBackToOffice}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Account Settings</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Display Information</h3>
          </div>
          <div className="space-y-4 pl-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <Select value={rank} onValueChange={setRank}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Officer">Officer</SelectItem>
                    <SelectItem value="Detective">Detective</SelectItem>
                    <SelectItem value="Sergeant">Sergeant</SelectItem>
                    <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                    <SelectItem value="Captain">Captain</SelectItem>
                    <SelectItem value="Inspector">Inspector</SelectItem>
                    <SelectItem value="Chief">Chief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patrol">Patrol</SelectItem>
                    <SelectItem value="Homicide">Homicide</SelectItem>
                    <SelectItem value="Narcotics">Narcotics</SelectItem>
                    <SelectItem value="Robbery">Robbery</SelectItem>
                    <SelectItem value="Special Victims">Special Victims</SelectItem>
                    <SelectItem value="Cyber Crime">Cyber Crime</SelectItem>
                    <SelectItem value="Internal Affairs">Internal Affairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <Separator />

        {/* Account Danger Zone */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
          </div>
          <div className="space-y-2 pl-7">
            <p className="text-sm text-gray-500">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-6">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onBackToOffice}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </CardFooter>
    </Card>
  )
}
