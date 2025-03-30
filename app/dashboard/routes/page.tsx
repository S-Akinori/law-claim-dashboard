"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Plus, Trash2, Edit } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { QuestionRouteDialog } from "@/components/question-route-dialog"

interface Question {
  id: string
  title: string
  text: string
  type: string
}

interface Option {
  id: string
  question_id: string
  text: string
  image_url?: string
}

interface QuestionRoute {
  id: string
  from_question_id: string
  next_question_id: string
  condition_group: string
  created_at: string
  from_question?: Question
  next_question?: Question
  conditions?: Condition[]
}

interface Condition {
  id: string
  question_id: string
  required_question_id: string
  required_option_id: string | null
  operator: string
  value: string | null
  condition_group: string
  required_question?: Question
  required_option?: Option
}

export default function RoutesPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [routes, setRoutes] = useState<QuestionRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<QuestionRoute | null>(null)
  const [options, setOptions] = useState<{ [key: string]: Option[] }>({})
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
      const { data: accountData, error: accountError } = await supabase.from("accounts").select("id").single()

      if (accountError || !accountData) {
        console.error("アカウント情報取得エラー:", accountError)
        setError("アカウント情報の取得に失敗しました")
        return
      }

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

      // 全ての選択肢を取得
      const { data: optionsData, error: optionsError } = await supabase.from("options").select("*")

      if (optionsError) {
        console.error("選択肢データ取得エラー:", optionsError)
        setError("選択肢データの取得に失敗しました")
        return
      }

      // 質問IDごとに選択肢をグループ化
      const optionsByQuestionId: { [key: string]: Option[] } = {}
      optionsData?.forEach((option) => {
        if (!optionsByQuestionId[option.question_id]) {
          optionsByQuestionId[option.question_id] = []
        }
        optionsByQuestionId[option.question_id].push(option)
      })
      setOptions(optionsByQuestionId)

      // ルートデータを取得
      const { data: routesData, error: routesError } = await supabase
        .from("question_routes")
        .select(`
          *,
          from_question:from_question_id(*),
          next_question:next_question_id(*)
        `)
        .order("created_at", { ascending: true })

      if (routesError) {
        console.error("ルートデータ取得エラー:", routesError)
        setError("ルートデータの取得に失敗しました")
        return
      }

      // 各ルートの条件を取得
      const routesWithConditions = await Promise.all(
        (routesData || []).map(async (route) => {
          const { data: conditionsData, error: conditionsError } = await supabase
            .from("conditions")
            .select(`
              *,
              required_question:required_question_id(*),
              required_option:required_option_id(*)
            `)
            .eq("question_id", route.from_question_id)
            .eq("condition_group", route.condition_group)
            .order("created_at", { ascending: true })

          if (conditionsError) {
            console.error("条件データ取得エラー:", conditionsError)
            return { ...route, conditions: [] }
          }

          return { ...route, conditions: conditionsData || [] }
        }),
      )

      setRoutes(routesWithConditions)
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoute = async (routeId: string) => {
    try {
      // まず、ルートに関連する条件を取得
      const targetRoute = routes.find((r) => r.id === routeId)
      if (!targetRoute) return

      // 条件を削除
      if (targetRoute.conditions && targetRoute.conditions.length > 0) {
        const { error: conditionsError } = await supabase
          .from("conditions")
          .delete()
          .eq("question_id", targetRoute.from_question_id)
          .eq("condition_group", targetRoute.condition_group)

        if (conditionsError) {
          console.error("条件削除エラー:", conditionsError)
          toast({
            variant: "destructive",
            title: "エラーが発生しました",
            description: "条件の削除に失敗しました",
          })
          return
        }
      }

      // ルートを削除
      const { error: routeError } = await supabase.from("question_routes").delete().eq("id", routeId)

      if (routeError) {
        console.error("ルート削除エラー:", routeError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "ルートの削除に失敗しました",
        })
        return
      }

      // 画面を更新
      setRoutes(routes.filter((route) => route.id !== routeId))

      toast({
        title: "ルートを削除しました",
        description: "ルートが正常に削除されました",
      })
    } catch (err) {
      console.error("ルート削除エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ルートの削除中にエラーが発生しました",
      })
    }
  }

  const handleOpenRouteDialog = (route: QuestionRoute | null = null) => {
    setSelectedRoute(route)
    setRouteDialogOpen(true)
  }

  const handleRouteDialogSubmit = async () => {
    // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
    fetchData()
    setRouteDialogOpen(false)
  }

  const getQuestionTitle = (questionId: string): string => {
    const question = questions.find((q) => q.id === questionId)
    return question ? question.title || question.text : "不明な質問"
  }

  const getConditionDescription = (condition: Condition): string => {
    let description = `「${condition.required_question?.title || "不明な質問"}」が `

    if (condition.required_option_id) {
      description += `「${condition.required_option?.text || "不明な選択肢"}」を選択した場合`
    } else {
      const operatorMap: { [key: string]: string } = {
        "=": "=",
        "!=": "≠",
        ">": ">",
        ">=": "≥",
        "<": "<",
        "<=": "≤",
        LIKE: "を含む",
      }

      description += `${operatorMap[condition.operator] || condition.operator} ${condition.value || ""}`
    }

    return description
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">質問ルート管理</h1>
            <p className="text-muted-foreground">質問の順序と条件分岐を設定します</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/routes/flow">
                <ArrowRight className="mr-2 h-4 w-4" />
                フロー表示
              </Link>
            </Button>
            <Button onClick={() => handleOpenRouteDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              新規ルート
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <p className="mb-4 text-muted-foreground">質問がまだ登録されていません</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/questions">
                  <Plus className="mr-2 h-4 w-4" />
                  質問を作成する
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : routes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <p className="mb-4 text-muted-foreground">質問ルートがまだ登録されていません</p>
              <Button onClick={() => handleOpenRouteDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                最初のルートを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>質問ルート一覧</CardTitle>
              <CardDescription>設定されている質問の遷移ルールの一覧です</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {questions.map((question) => {
                  // この質問からの遷移ルートを取得
                  const questionRoutes = routes.filter((route) => route.from_question_id === question.id)

                  if (questionRoutes.length === 0) return null

                  return (
                    <AccordionItem key={question.id} value={question.id} className="border-b last:border-b-0">
                      <AccordionTrigger className="px-4 hover:bg-muted/50">
                        {question.title || question.text}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pt-2 pb-4">
                        <div className="space-y-4">
                          {questionRoutes.map((route) => (
                            <div key={route.id} className="rounded-md border p-4 hover:bg-muted/50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <div className="font-medium">{getQuestionTitle(route.from_question_id)}</div>
                                    <ArrowRight className="mx-2 h-4 w-4" />
                                    <div className="font-medium">{getQuestionTitle(route.next_question_id)}</div>
                                  </div>

                                  {route.conditions && route.conditions.length > 0 ? (
                                    <div className="text-sm">
                                      <p className="font-medium mb-1">条件:</p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {route.conditions.map((condition) => (
                                          <li key={condition.id}>{getConditionDescription(condition)}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">条件なし（常に遷移）</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenRouteDialog(route)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">編集</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteRoute(route.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">削除</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      <QuestionRouteDialog
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
        questions={questions}
        options={options}
        route={selectedRoute}
        onSubmit={handleRouteDialogSubmit}
      />
    </DashboardLayout>
  )
}

