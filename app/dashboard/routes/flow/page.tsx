"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase/client"
import { QuestionFlowChart } from "@/components/question-flow-chart"
import { VisualFlowChart } from "@/components/visual-flow-chart"

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

export default function FlowPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [routes, setRoutes] = useState<QuestionRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/dashboard/routes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ルート一覧に戻る
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">質問フロー</h1>
              <p className="text-muted-foreground">質問の流れを視覚的に確認できます</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">質問がまだ登録されていません</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/questions">質問を作成する</Link>
            </Button>
          </div>
        ) : routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-muted-foreground">質問ルートがまだ登録されていません</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/routes">ルートを設定する</Link>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="visual">
            <TabsList>
              <TabsTrigger value="visual">ビジュアルフロー</TabsTrigger>
              <TabsTrigger value="tree">ツリー表示</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="mt-6">
              <VisualFlowChart questions={questions} routes={routes} />
            </TabsContent>

            <TabsContent value="tree" className="mt-6">
              <QuestionFlowChart questions={questions} routes={routes} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}

