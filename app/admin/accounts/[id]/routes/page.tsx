"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Plus, Trash2, Edit } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { Tables } from "@/database.types"
import { QuestionRouteDialog } from "@/components/question-route-dialog"

interface Question extends Tables<"questions"> {
  options: Tables<"options">[]
}

type Option = Tables<"options">

type QuestionRoute = Tables<"question_routes">

type Condition = Tables<"conditions">

export default function RoutesPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [routes, setRoutes] = useState<QuestionRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<QuestionRoute | null>(null)
  const [options, setOptions] = useState<{ [key: string]: Option[] }>({})
  const supabase = createClient()

  const { id } = useParams<{ id: string }>() // Assuming you are using a router that provides this


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 質問データを取得
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*, options(*)")
        .eq("account_id", id)
        .order("created_at", { ascending: true })

      if (questionsError) {
        console.error("質問データ取得エラー:", questionsError)
        setError("質問データの取得に失敗しました")
        return
      }

      setQuestions(questionsData || [])

      // 質問IDごとに選択肢をグループ化
      const optionsByQuestionId: { [key: string]: Option[] } = {}
      questionsData.forEach((question) => {
        // if (!optionsByQuestionId[question.id]) {
        //   optionsByQuestionId[question.id] = []
        // }
        optionsByQuestionId[question.id] = question.options
      })
      console.log(questionsData)
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
          return
        }
      }

      // ルートを削除
      const { error: routeError } = await supabase.from("question_routes").delete().eq("id", routeId)

      if (routeError) {
        console.error("ルート削除エラー:", routeError)
        return
      }

      // 画面を更新
      setRoutes(routes.filter((route) => route.id !== routeId))

    } catch (err) {
      console.error("ルート削除エラー:", err)

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
      <>
        <div className="flex justify-center py-6">
          <p>読み込み中...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">質問ルート管理</h1>
            <p className="text-muted-foreground">質問の順序と条件分岐を設定します</p>
          </div>
          <div className="flex gap-2">
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
                <Link href="/admin/questions">
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
        accountId={id}
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
        questions={questions}
        options={options}
        route={selectedRoute}
        onSubmit={handleRouteDialogSubmit}
      />
    </>
  )
}

