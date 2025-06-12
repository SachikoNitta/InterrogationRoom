import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Building2 } from "lucide-react";
import { auth, signInWithGoogle } from "@/lib/auth";

interface EntranceProps {
  onStartCase: () => void;
  onGoToOffice: () => void;
}

export const Entrance: React.FC<EntranceProps> = ({ onStartCase, onGoToOffice }) => {

  const handleGoogleLogin = useCallback(async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      if (user) {
        const idToken = await user.getIdToken();
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          },
        });
        if (!res.ok) {
          throw new Error("API login failed");
        }
      }
    } catch (e) {
      alert("ログインに失敗しました");
    }
  }, []);

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="text-center py-12">
        <CardTitle className="text-4xl font-bold text-gray-800 mb-8">Interrogation Room</CardTitle>
      </CardHeader>
      <CardContent className="px-12 pb-12">
        <div className="flex flex-col space-y-4 max-w-md mx-auto">
          { auth.currentUser ? (
            <>
              <Button size="lg" className="h-14 text-lg" onClick={onStartCase}>
                <MessageSquare className="mr-3 h-5 w-5" />
                Start a Case
              </Button>
              <Button size="lg" variant="outline" className="h-14 text-lg" onClick={onGoToOffice}>
                <Building2 className="mr-3 h-5 w-5" />
                Go to Office
              </Button>
            </>
          ) : (
            <Button size="lg" className="h-14 text-lg" onClick={handleGoogleLogin}>
              Googleでログイン
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
