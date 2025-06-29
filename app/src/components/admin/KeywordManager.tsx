'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  category: string;
  description: string;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

export function KeywordManager() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    keyword: '',
    category: 'general',
    description: ''
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
        ? `/api/admin/keywords/${editingKeyword.id}`
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
        setFormData({ keyword: '', category: 'general', description: '' });
        loadKeywords();
      }
    } catch (error) {
      console.error('Failed to save keyword:', error);
    }
  };

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword: keyword.keyword,
      category: keyword.category,
      description: keyword.description
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

  const toggleActive = async (keyword: Keyword) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/admin/keywords/${keyword.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !keyword.active })
      });

      if (response.ok) {
        loadKeywords();
      }
    } catch (error) {
      console.error('Failed to toggle keyword status:', error);
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
                  setFormData({ keyword: '', category: 'general', description: '' });
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
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    placeholder="例: うどん, 食べ物"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    カテゴリ
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="例: food, emotion, action"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    説明
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="このキーワードの用途や意味を説明"
                    rows={3}
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
                key={keyword.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{keyword.keyword}</span>
                      <Badge variant={keyword.active ? 'default' : 'secondary'}>
                        {keyword.category}
                      </Badge>
                      {keyword.active ? (
                        <Badge variant="outline" className="text-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          アクティブ
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <X className="w-3 h-3 mr-1" />
                          非アクティブ
                        </Badge>
                      )}
                    </div>
                    {keyword.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {keyword.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(keyword)}
                  >
                    {keyword.active ? '無効化' : '有効化'}
                  </Button>
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
                    onClick={() => handleDelete(keyword.id)}
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