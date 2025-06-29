'use client'

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeywordManager } from '@/components/admin/KeywordManager';
import { SummaryManager } from '@/components/admin/SummaryManager';
import { Shield, Key, FileText, Users } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const checkAdminStatus = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      setIsAdmin(false);
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, loading, router, checkAdminStatus]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <p className="text-lg">管理者権限を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <CardTitle>アクセス拒否</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">このページは管理者のみアクセス可能です。</p>
            <Button onClick={() => router.push('/dashboard')}>
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.displayName || user?.email}
              </span>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                ユーザーダッシュボード
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* タブ式管理インターフェース */}
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="keywords">キーワード管理</TabsTrigger>
              <TabsTrigger value="summaries">事件シナリオ管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="keywords" className="space-y-4">
              <KeywordManager />
            </TabsContent>
            
            <TabsContent value="summaries" className="space-y-4">
              <SummaryManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}