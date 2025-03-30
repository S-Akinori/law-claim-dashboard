"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface AccountSettings {
  id: string
  name: string
  first_question_id: string | null
  final_question_id: string | null
}

export default function FlowSettingsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [settings, setSettings] = useState<AccountSettings | null>(null)
  const [firstQuestionId, setFirstQuestionId] = useState<string>("")
  const [finalQuestionId, setFinalQuestionId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("*").single()

      if (accountError) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      setSettings(accountData)
      setFirstQuestionId(accountData.first_question_id || "")
      setFinalQuestionId(accountData.final_question_id || "")

      // 質問データを取得
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: true })

      if (questionsError) {
        console.error("質問データ取得エラー:", questionsError)
        setError("質問データの取得に失敗しました")
        return
      }

      setQuestions(questionsData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError(null)

      const { error } = await supabase
        .from("accounts")
        .update({
          first_question_id: firstQuestionId || null,
          final_question_id: finalQuestionId || null,
        })
        .eq("id", settings.id)

      if (error) {
        console.error("設定保存エラー:", error)
        setError("設定の保存に失敗しました")
        return
      }

      toast({
        title: "設定を保存しました",
        description: "質問フロー設定が正常に更新されました",
      })

      // 最新データを再取得
      fetchData()
    } catch (err) {
      console.error("保存エラー:", err)
      setError("保存中にエラーが発生しました")
    } finally {
      setSaving(false)
    }
  }

  const getQuestionLabel = (question: Question): string => {
    return question.title || question.text.substring(0, 30) + (question.text.length > 30 ? "..." : "")
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
          <h1 className="text-3xl font-bold tracking-tight">質問フロー設定</h1>
          <p className="text-muted-foreground">質問フローの開始・終了質問を設定します</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>フロー設定</CardTitle>
            <CardDescription>質問フローの開始・終了質問を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                質問が登録されていません。先に質問を作成してください。
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">最初の質問</h3>
                  <p className="text-sm text-muted-foreground mb-2">ユーザーが最初に表示される質問を選択します</p>
                  <Select value={firstQuestionId} onValueChange={setFirstQuestionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="最初の質問を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">選択なし</SelectItem>
                      {questions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          {getQuestionLabel(question)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">最後の質問</h3>
                  <p className="text-sm text-muted-foreground mb-2">フローの最後に表示される質問を選択します</p>
                  <Select value={finalQuestionId} onValueChange={setFinalQuestionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="最後の質問を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">選択なし</SelectItem>
                      {questions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          {getQuestionLabel(question)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* フロー概要表示 */}
                <div className="mt-8 bg-muted/40 p-4 rounded-md">
                  <h3 className="font-medium mb-2">現在のフロー設定</h3>
                  <div className="flex items-center text-sm">
                    <div className="px-3 py-2 rounded-md bg-primary/10 border">
                      {firstQuestionId
                        ? getQuestionLabel(questions.find((q) => q.id === firstQuestionId) as Question)
                        : "設定なし"}
                    </div>
                    <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 text-muted-foreground text-xs">（質問ルートに基づく中間の質問フロー）</div>
                    <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />
                    <div className="px-3 py-2 rounded-md bg-primary/10 border">
                      {finalQuestionId
                        ? getQuestionLabel(questions.find((q) => q.id === finalQuestionId) as Question)
                        : "設定なし"}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || questions.length === 0}>
              {saving ? "保存中..." : "設定を保存"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">最初の質問</h3>
              <p className="text-sm text-muted-foreground">
                この設定により、ユーザーがLINEで会話を開始した時に最初に表示される質問を指定できます。
                設定しない場合は、LINE Botシステムの初期設定に基づいて最初の質問が選択されます。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">最後の質問</h3>
              <p className="text-sm text-muted-foreground">
                この設定により、質問フローの最後に表示される質問を指定できます。
                通常は結果や謝辞などを表示するために使用します。
                設定しない場合は、質問ルートに基づいて質問フローが終了します。
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">注意事項</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>最初の質問を設定しても、質問ルートに基づくフローを適切に設定することが重要です。</li>
                <li>質問ルートが最初の質問からつながっていることを確認してください。</li>
                <li>最後の質問に達した後、ユーザーがさらに入力を続けると、再び最初の質問から開始されます。</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

