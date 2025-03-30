"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminLayout from "@/components/admin-layout"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MasterQuestionDialog } from "@/components/master-question-dialog"

interface MasterQuestion {
  id: string
  text: string
  options: string[]
  order: number
  created_at: string
}

export default function MasterQuestionsPage() {
  const [questions, setQuestions] = useState<MasterQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<MasterQuestion | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("master_questions").select("*").order("order", { ascending: true })

      if (error) {
        console.error("質問取得エラー:", error)
        setError("質問の取得に失敗しました")
        return
      }

      setQuestions(data || [])
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // 関連するマスターオプションを確認
      const { count, error: countError } = await supabase
        .from("master_options")
        .select("*", { count: "exact", head: true })
        .eq("question_id", questionId)

      if (countError) {
        console.error("関連データ確認エラー:", countError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "関連データの確認に失敗しました",
        })
        return
      }

      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "削除できません",
          description: `この質問には${count}個の選択肢が関連付けられています。先に選択肢を削除してください。`,
        })
        return
      }

      // 質問を削除
      const { error } = await supabase.from("master_questions").delete().eq("id", questionId)

      if (error) {
        console.error("質問削除エラー:", error)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "質問の削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setQuestions(questions.filter((question) => question.id !== questionId))

      toast({
        title: "質問を削除しました",
        description: "マスター質問が正常に削除されました",
      })
    } catch (err) {
      console.error("質問削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "質問の削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenDialog = (question: MasterQuestion | null = null) => {
    setSelectedQuestion(question)
    setDialogOpen(true)
  }

  const handleDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchQuestions()
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-6">
          <p>読み込み中...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">マスター質問管理</h1>
            <p className="text-muted-foreground">デフォルトで使用される質問を管理します</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            新規質問
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>マスター質問一覧</CardTitle>
            <CardDescription>デフォルトで使用される質問の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-4 text-muted-foreground">マスター質問がまだ登録されていません</p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  最初の質問を作成
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">順序</TableHead>
                    <TableHead>質問内容</TableHead>
                    <TableHead>選択肢</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.order}</TableCell>
                      <TableCell>{question.text}</TableCell>
                      <TableCell>
                        {question.options && question.options.length > 0 ? question.options.join(", ") : "自由回答"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(question)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuestion(question.id)}
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

      <MasterQuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        question={selectedQuestion}
        onSubmit={handleDialogSubmit}
      />
    </AdminLayout>
  )
}

