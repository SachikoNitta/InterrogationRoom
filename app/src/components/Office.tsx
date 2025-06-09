import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Coins, Settings, User, FileText, Calendar, Clock } from "lucide-react";
import React from "react";

interface OfficeProps {
  onBackToEntrance: () => void;
  onPreferencesClick: () => void;
  onStartCase: () => void;
  cases: any[];
  getStatusColor: (status: string) => string;
}

export const Office: React.FC<OfficeProps> = ({ onBackToEntrance, onPreferencesClick, onStartCase, cases, getStatusColor }) => (
  <Card className="w-full max-w-4xl shadow-lg">
    <CardHeader className="border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBackToEntrance}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Office</CardTitle>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      {/* Profile Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Detective Smith" />
            <AvatarFallback className="text-lg">DS</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Detective Sarah Smith</h2>
            <p className="text-gray-600">Senior Investigator</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>s.smith@department.gov</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      {/* AI Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">AI Tokens</h3>
          </div>
          <Button variant="outline" size="sm">
            Purchase More
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2,847</div>
            <div className="text-sm text-blue-600">Available Tokens</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">1,153</div>
            <div className="text-sm text-green-600">Used This Month</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">5,000</div>
            <div className="text-sm text-orange-600">Monthly Limit</div>
          </div>
        </div>
      </div>
      <Separator />
      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="flex space-x-3">
          <Button onClick={onPreferencesClick}>
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
          <Button variant="outline">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      <Separator />
      {/* Past Cases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Cases</h3>
          <Badge variant="secondary">{cases.length} Total Cases</Badge>
        </div>
        <div className="space-y-3">
          {cases.map((case_) => (
            <div
              key={case_.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={onStartCase}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{case_.caseId}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{case_.createdAt ? case_.createdAt.split("T")[0] : ""}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{case_.createdAt ? case_.createdAt.split("T")[1].slice(0,5) : ""}</span>
                    </div>
                    <span>{case_.logs.length} messages</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                  {case_.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
