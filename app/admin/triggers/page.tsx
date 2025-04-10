"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { TriggerDialog } from "@/components/master-trigger-dialog"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Trigger {
  id: string
  keyword: string
  master_question_id: string
  created_at: string
  master_question?: Question
}

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        setError("ユーザー情報の取得に失敗しました")
        return
      }

      // アカウント情報を取得
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").eq('user_id', userData.user.id).single()
      

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

      // 質問データを取得
      const { data: questionsData, error: questionsError } = await supabase
        .from("master_questions")
        .select("*")
        .order("created_at", { ascending: true })

      if (questionsError) {
        console.error("質問データ取得エラー:", questionsError)
        setError("質問データの取得に失敗しました")
        return
      }

      setQuestions(questionsData || [])

      // トリガーデータを取得
      const { data: triggersData, error: triggersError } = await supabase
        .from("master_start_triggers")
        .select(`
          *,
          master_question:master_question_id(*)
        `)
        .order("created_at", { ascending: true })

      if (triggersError) {
        console.error("トリガーデータ取得エラー:", triggersError)
        setError("トリガーデータの取得に失敗しました")
        return
      }

      setTriggers(triggersData || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrigger = async (triggerId: string) => {
    try {
      const { error } = await supabase.from("master_start_triggers").delete().eq("id", triggerId)

      if (error) {
        console.error("トリガー削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "トリガーの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setTriggers(triggers.filter((trigger) => trigger.id !== triggerId))

      toast({
        title: "トリガーを削除しました",
        description: "トリガーが正常に削除されました",
      })
    } catch (err) {
      console.error("トリガー削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "トリガーの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (trigger: Trigger | null = null) => {
    setSelectedTrigger(trigger)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchData()
    setDialogOpen(false)
  }

  const getQuestionTitle = (questionId: string): string => {
    const question = questions.find((q) => q.id === questionId)
    return question ? question.title || question.text : "不明な質問"
  }


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">スタートトリガー管理</h1>
            <p className="text-muted-foreground">特定のキーワードで開始する質問を設定します</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規トリガー
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>スタートトリガー一覧</CardTitle>
            <CardDescription>設定されているキーワードと開始質問の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {triggers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">スタートトリガーがまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初のトリガーを作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>キーワード</TableHead>
                    <TableHead>開始質問</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggers.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">{trigger.keyword}</TableCell>
                      <TableCell>{getQuestionTitle(trigger.master_question_id)}</TableCell>
                      <TableCell>{new Date(trigger.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(trigger)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTrigger(trigger.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <TriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        questions={questions}
        trigger={selectedTrigger}
        onSubmit={handleDialogSubmit}
      />
    </>
  )
}

