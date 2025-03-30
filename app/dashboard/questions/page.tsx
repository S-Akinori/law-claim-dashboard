"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  title: string
  text: string
  type: string
  created_at: string
  options_count: number
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)

      // 質問データを取得
      const { data: questionsData, error: questionsError } = await supabase.from("questions").select(`
          id,
          title,
          text,
          type,
          created_at
        `)

      if (questionsError) {
        console.error("質問データ取得エラー:", questionsError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "質問データの取得に失敗しました",
        })
        return
      }

      // 各質問の選択肢数を取得
      const questionsWithOptions = await Promise.all(
        questionsData.map(async (question) => {
          const { count, error: countError } = await supabase
            .from("options")
            .select("id", { count: "exact" })
            .eq("question_id", question.id)

          return {
            ...question,
            options_count: count || 0,
          }
        }),
      )

      setQuestions(questionsWithOptions)
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "データの取得中にエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id)

      if (error) {
        toast({
          variant: "destructive",
          title: "削除エラー",
          description: "質問の削除に失敗しました",
        })
        return
      }

      toast({
        title: "質問を削除しました",
        description: "質問が正常に削除されました",
      })

      // 質問リストを更新
      fetchQuestions()
    } catch (error) {
      console.error("削除エラー:", error)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "質問の削除中にエラーが発生しました",
      })
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "テキスト"
      case "image_carousel":
        return "画像カルーセル"
      case "button":
        return "ボタン"
      default:
        return type
    }
  }

  const getQuestionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "text":
        return "default"
      case "image_carousel":
        return "secondary"
      case "button":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">質問管理</h1>
            <p className="text-muted-foreground">質問の作成、編集、削除を行います</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/questions/new">
              <Plus className="mr-2 h-4 w-4" />
              新規質問
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>質問一覧</CardTitle>
            <CardDescription>システムに登録されている質問の一覧です</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <p>読み込み中...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-2 text-muted-foreground">質問がまだ登録されていません</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/questions/new">
                    <Plus className="mr-2 h-4 w-4" />
                    最初の質問を作成
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>質問内容</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>選択肢数</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.title || "（タイトルなし）"}</TableCell>
                      <TableCell className="max-w-xs truncate">{question.text}</TableCell>
                      <TableCell>
                        <Badge variant={getQuestionTypeBadgeVariant(question.type) as any}>
                          {getQuestionTypeLabel(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.options_count}</TableCell>
                      <TableCell>{new Date(question.created_at).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">メニューを開く</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/questions/${question.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                編集
                              </Link>
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
    </DashboardLayout>
  )
}

