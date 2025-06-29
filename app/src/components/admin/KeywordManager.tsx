'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Keyword {
  keywordId: string;
  word: string;
}

export function KeywordManager() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    word: ''
  });

  const loadKeywords = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/keywords', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords);
      }
    } catch (error) {
      console.error('Failed to load keywords:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await user?.getIdToken();
      const url = editingKeyword 
        ? `/api/admin/keywords/${editingKeyword.keywordId}`
        : '/api/admin/keywords';
      
      const method = editingKeyword ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingKeyword(null);
        setFormData({ word: '' });
        loadKeywords();
      }
    } catch (error) {
      console.error('Failed to save keyword:', error);
    }
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      word: keyword.word
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (keywordId: string) => {
    if (!confirm('このキーワードを削除しますか？')) return;

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/keywords/${keywordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadKeywords();
      }
    } catch (error) {
      console.error('Failed to delete keyword:', error);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p>キーワードを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>キーワード管理</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingKeyword(null);
                  setFormData({ word: '' });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                新規キーワード
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingKeyword ? 'キーワード編集' : '新規キーワード作成'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    キーワード
                  </label>
                  <Input
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    placeholder="例: うどん, 食べ物"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    キャンセル
                  </Button>
                  <Button type="submit">
                    {editingKeyword ? '更新' : '作成'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {keywords.map((keyword) => (
              <div
                key={keyword.keywordId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{keyword.word}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(keyword)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(keyword.keywordId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {keywords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>キーワードがまだ登録されていません。</p>
                <p className="text-sm">「新規キーワード」ボタンから追加してください。</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}