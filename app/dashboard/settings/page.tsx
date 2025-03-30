"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [lineChannelId, setLineChannelId] = useState("")
  const [lineChannelSecret, setLineChannelSecret] = useState("")
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState("")
  const [finalQuestionId, setFinalQuestionId] = useState("")
  const [emailQuestionId, setEmailQuestionId] = useState("")
  const [useMaster, setUseMaster] = useState(false)
  const [questions, setQuestions] = useState<{ id: string; text: string }[]>([])
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
    fetchQuestions()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("*").single()

      if (accountError) {
        console.error("アカウント情報取得エラー:", accountError)
        return
      }

      if (accountData) {
        setCompanyName(accountData.name || "")
        setLineChannelId(accountData.line_channel_id || "")
        setLineChannelSecret(accountData.line_channel_secret || "")
        setLineChannelAccessToken(accountData.line_channel_access_token || "")
        setFinalQuestionId(accountData.final_question_id || "")
        setEmailQuestionId(accountData.email_question_id || "")
        setUseMaster(accountData.use_master || false)
      }
    } catch (error) {
      console.error("設定取得エラー:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      // 質問一覧を取得
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id, text")
        .order("order", { ascending: true })

      if (questionsError) {
        console.error("質問取得エラー:", questionsError)
        return
      }

      setQuestions(questionsData || [])
    } catch (error) {
      console.error("質問取得エラー:", error)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)

      // アカウント情報を更新
      const { error: updateError } = await supabase
        .from("accounts")
        .update({
          name: companyName,
          line_channel_id: lineChannelId,
          line_channel_secret: lineChannelSecret,
          line_channel_access_token: lineChannelAccessToken,
          final_question_id: finalQuestionId,
          email_question_id: emailQuestionId,
          use_master: useMaster,
        })
        .eq("id", (await supabase.from("accounts").select("id").single()).data?.id)

      if (updateError) {
        console.error("設定更新エラー:", updateError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "設定の保存に失敗しました",
        })
        return
      }

      toast({
        title: "設定を保存しました",
        description: "設定が正常に保存されました",
      })
    } catch (error) {
      console.error("設定保存エラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "設定の保存中にエラーが発生しました",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-6">
          <p>読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">設定</h1>
          <p className="text-muted-foreground">アプリケーションの設定を管理します</p>
        </div>

        <Tabs defaultValue="company">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="company">会社設定</TabsTrigger>
            <TabsTrigger value="line">LINE設定</TabsTrigger>
            <TabsTrigger value="final">最終設定</TabsTrigger>
            <TabsTrigger value="master">マスターデータ設定</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>会社情報</CardTitle>
                <CardDescription>会社の基本情報を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">会社名</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="会社名を入力"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="line" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>LINE設定</CardTitle>
                <CardDescription>LINE Messaging APIの設定を行います</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lineChannelId">チャネルID</Label>
                  <Input
                    id="lineChannelId"
                    value={lineChannelId}
                    onChange={(e) => setLineChannelId(e.target.value)}
                    placeholder="チャネルIDを入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineChannelSecret">チャネルシークレット</Label>
                  <Input
                    id="lineChannelSecret"
                    type="password"
                    value={lineChannelSecret}
                    onChange={(e) => setLineChannelSecret(e.target.value)}
                    placeholder="チャネルシークレットを入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineChannelAccessToken">チャネルアクセストークン</Label>
                  <Input
                    id="lineChannelAccessToken"
                    type="password"
                    value={lineChannelAccessToken}
                    onChange={(e) => setLineChannelAccessToken(e.target.value)}
                    placeholder="チャネルアクセストークンを入力"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="final" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最終設定</CardTitle>
                <CardDescription>最終質問とメール質問の設定を行います</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="finalQuestionId">最終質問</Label>
                  <select
                    id="finalQuestionId"
                    value={finalQuestionId}
                    onChange={(e) => setFinalQuestionId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">選択してください</option>
                    {questions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.text}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">最終質問に達したユーザーには、メールが送信されます</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailQuestionId">メールアドレス質問</Label>
                  <select
                    id="emailQuestionId"
                    value={emailQuestionId}
                    onChange={(e) => setEmailQuestionId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">選択してください</option>
                    {questions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.text}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">この質問の回答からメールアドレスを取得します</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="master" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>マスターデータ設定</CardTitle>
                <CardDescription>デフォルトのマスターデータ使用設定を行います</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="useMaster" className="flex flex-col space-y-1">
                    <span>デフォルトのマスターデータを使用する</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      質問などのデフォルトマスターデータを使用します
                    </span>
                  </Label>
                  <Switch id="useMaster" checked={useMaster} onCheckedChange={setUseMaster} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

