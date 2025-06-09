import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Palette, Shield, Database, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React from "react";

interface PreferencesProps {
  notifications: boolean;
  autoSave: boolean;
  theme: string;
  language: string;
  dataRetention: string;
  setNotifications: (v: boolean) => void;
  setAutoSave: (v: boolean) => void;
  setTheme: (v: string) => void;
  setLanguage: (v: string) => void;
  setDataRetention: (v: string) => void;
  onBackToOffice: () => void;
}

export const Preferences: React.FC<PreferencesProps> = ({ notifications, autoSave, theme, language, dataRetention, setNotifications, setAutoSave, setTheme, setLanguage, setDataRetention, onBackToOffice }) => (
  <Card className="w-full max-w-4xl shadow-lg">
    <CardHeader className="border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBackToOffice}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Preferences</CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      {/* Notifications Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-3 pl-7">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-gray-500">Receive alerts for new messages and case updates</p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-save">Auto-save Cases</Label>
              <p className="text-sm text-gray-500">Automatically save case progress every 5 minutes</p>
            </div>
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </div>
      </div>
      <Separator />
      {/* Appearance Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Appearance</h3>
        </div>
        <div className="space-y-3 pl-7">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator />
      {/* Security & Privacy Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Security & Privacy</h3>
        </div>
        <div className="space-y-3 pl-7">
          <div className="space-y-2">
            <Label htmlFor="data-retention">Data Retention Period</Label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="forever">Forever</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">How long to keep case data before automatic deletion</p>
          </div>
        </div>
      </div>
      <Separator />
      {/* Data Management Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>
        <div className="space-y-3 pl-7">
          <div className="flex space-x-3">
            <Button variant="outline">Export All Cases</Button>
            <Button variant="outline">Clear Cache</Button>
            <Button variant="destructive">Delete All Data</Button>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="border-t p-6">
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onBackToOffice}>
          Cancel
        </Button>
        <Button>Save Changes</Button>
      </div>
    </CardFooter>
  </Card>
);
