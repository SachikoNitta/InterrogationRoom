'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { FileText, Play, Search, Plus } from 'lucide-react';
import { Summary } from '@/types/summary';

interface InvestigationSummary extends Summary {
  id: string;
  generatedAt: any;
}

export function SummaryManager() {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [keywordCount, setKeywordCount] = useState(3);

  const loadSummaries = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/summaries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummaries(data.summaries || []);
      }
    } catch (error) {
      console.error('Failed to load summaries:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const generateSummary = async () => {
    setGenerating(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/summaries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          keywordCount
        })
      });

      if (response.ok) {
        loadSummaries();
      } else {
        const errorData = await response.json();
        console.error('Failed to generate summary:', errorData);
        alert(`生成に失敗しました: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('生成中にエラーが発生しました');
    } finally {
      setGenerating(false);
    }
  };

  const filteredSummaries = summaries.filter(summary =>
    summary.summaryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.overview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP') + ' ' + date.toLocaleTimeString('ja-JP');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>サマリーを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 事件シナリオ生成セクション */}
      <Card>
        <CardHeader>
          <CardTitle>新規事件シナリオ生成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                使用するキーワード数
              </label>
              <select
                value={keywordCount}
                onChange={(e) => setKeywordCount(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>1個</option>
                <option value={2}>2個</option>
                <option value={3}>3個</option>
                <option value={4}>4個</option>
                <option value={5}>5個</option>
              </select>
            </div>
            <div className="flex flex-col">
              <div className="h-6"></div> {/* Spacer for label alignment */}
              <Button
                onClick={generateSummary}
                disabled={generating}
              >
                <Plus className="w-4 h-4 mr-2" />
                {generating ? 'AI生成中...' : '事件シナリオ生成'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            ランダムなキーワードを使用してAIが架空の事件シナリオを生成します。
          </p>
        </CardContent>
      </Card>

      {/* 事件シナリオ一覧セクション */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>生成済み事件シナリオ</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="事件名、概要、カテゴリで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSummaries.map((summary) => (
              <div
                key={summary.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">
                      {summary.summaryName || '無題'}
                    </span>
                    {summary.category && (
                      <Badge variant="outline">
                        {summary.category}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(summary.generatedAt)}
                  </span>
                </div>

                <div className="space-y-2">
                  {summary.dateOfIncident && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        事件発生日: 
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        {summary.dateOfIncident}
                      </span>
                    </div>
                  )}

                  {summary.overview && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        概要:
                      </span>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm">
                          {summary.overview}
                        </p>
                      </div>
                    </div>
                  )}

                  {summary.suspectInfo && summary.suspectInfo.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        容疑者:
                      </span>
                      <div className="mt-1">
                        {summary.suspectInfo.map((suspect, index) => (
                          <Badge key={index} variant="secondary" className="mr-1">
                            {suspect.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredSummaries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? (
                  <p>検索条件に一致する事件シナリオが見つかりません。</p>
                ) : (
                  <p>まだ事件シナリオが生成されていません。</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}