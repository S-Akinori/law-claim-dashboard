"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Account {
  id: string
  name: string
  user_id: string | null
  use_master: boolean
  created_at: string
  line_channel_id: string | null
  line_channel_secret: string | null
  line_channel_access_token: string | null
}

interface AccountDetailProps {
  accountId: string
}

export function AccountDetail({ accountId }: AccountDetailProps) {
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [userCount, setUserCount] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchAccountData()
  }, [accountId])

  const fetchAccountData = async () => {
    try {
      setLoading(true)
      setError(null)

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", accountId)
        .single()

      if (accountError) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      setAccount(accountData)

      // 質問数を取得
      const { count: questionCount, error: questionError } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", accountId)

      if (!questionError) {
        setQuestionCount(questionCount || 0)
      }

      // ユーザー数を取得（実際のアプリケーションでは適切なテーブルから取得）
      // この例では仮のデータを設定
      setUserCount(Math.floor(Math.random() * 100))
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!account) {
    return (
      <Alert variant="destructive">
        <AlertDescription>アカウントが見つかりませんでした</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
          <CardDescription>アカウントの基本情報</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">アカウント名</h3>
              <p>{account.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">作成日</h3>
              <p>{new Date(account.created_at).toLocaleDateString("ja-JP")}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">ユーザーID</h3>
              <p>{account.user_id || "未設定"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">マスターデータ</h3>
              <p>
                {account.use_master ? <Badge variant="default">使用中</Badge> : <Badge variant="outline">未使用</Badge>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">統計情報</TabsTrigger>
          <TabsTrigger value="line">LINE設定</TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>統計情報</CardTitle>
              <CardDescription>アカウントの利用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <h3 className="font-bold text-lg mb-2">質問数</h3>
                  <p className="text-3xl font-bold">{questionCount}</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <h3 className="font-bold text-lg mb-2">ユーザー数</h3>
                  <p className="text-3xl font-bold">{userCount}</p>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-sm border">
                  <h3 className="font-bold text-lg mb-2">最終アクティビティ</h3>
                  <p className="text-lg">{new Date().toLocaleDateString("ja-JP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="line" className="space-y-4 mt-2">
          <Card>
            <CardHeader>
              <CardTitle>LINE設定</CardTitle>
              <CardDescription>LINEチャンネル情報</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">チャネルID</h3>
                <p>{account.line_channel_id || "未設定"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">チャネルシークレット</h3>
                <p>{account.line_channel_secret ? "********" : "未設定"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">チャネルアクセストークン</h3>
                <p>{account.line_channel_access_token ? "********" : "未設定"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

