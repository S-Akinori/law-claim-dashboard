"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [questionStats, setQuestionStats] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // 質問ごとの回答数を取得
      const { data: statsData, error: statsError } = await supabase.from("user_responses").select(`
          id,
          created_at,
          question_id,
          questions(text)
        `)

      if (statsError) {
        console.error("統計データ取得エラー:", statsError)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: "統計データの取得に失敗しました",
        })
        return
      }

      // 期間でフィルタリング
      let filteredData = statsData
      if (selectedPeriod !== "all") {
        const now = new Date()
        const startDate = new Date()

        if (selectedPeriod === "week") {
          startDate.setDate(now.getDate() - 7)
        } else if (selectedPeriod === "month") {
          startDate.setMonth(now.getMonth() - 1)
        } else if (selectedPeriod === "year") {
          startDate.setFullYear(now.getFullYear() - 1)
        }

        filteredData = statsData.filter((item) => new Date(item.created_at) >= startDate)
      }

      // 質問ごとに集計
      const questionMap = new Map()
      filteredData.forEach((response) => {
        const questionId = response.question_id
        if (!questionMap.has(questionId)) {
          questionMap.set(questionId, {
            question_id: questionId,
            question_text: response.questions?.text || "不明な質問",
            response_count: 0,
          })
        }

        const questionStat = questionMap.get(questionId)
        questionStat.response_count += 1
      })

      setQuestionStats(Array.from(questionMap.values()))
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">分析</h1>
            <p className="text-muted-foreground">ユーザーの回答データを分析します</p>
          </div>
          <div className="w-[180px]">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての期間</SelectItem>
                <SelectItem value="week">過去1週間</SelectItem>
                <SelectItem value="month">過去1ヶ月</SelectItem>
                <SelectItem value="year">過去1年</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="questions">
          <TabsList>
            <TabsTrigger value="questions">質問分析</TabsTrigger>
            <TabsTrigger value="users">ユーザー分析</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>質問ごとの回答数</CardTitle>
                <CardDescription>各質問に対する回答数の統計</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <p>読み込み中...</p>
                  </div>
                ) : questionStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-muted-foreground">データがありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questionStats.map((stat) => (
                      <div key={stat.question_id} className="flex items-center justify-between">
                        <div className="truncate max-w-[70%]">
                          <p className="font-medium">{stat.question_text}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.min(100, (stat.response_count / Math.max(...questionStats.map((s) => s.response_count))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{stat.response_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ユーザー統計</CardTitle>
                <CardDescription>ユーザーの利用状況に���する統計</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg mb-2">新規ユー��ー</h3>
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">+12% 先週比</p>
                  </div>
                  <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg mb-2">アクティブユーザー</h3>
                    <p className="text-3xl font-bold">78</p>
                    <p className="text-xs text-muted-foreground">+5% 先週比</p>
                  </div>
                  <div className="bg-card p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg mb-2">平均回答数</h3>
                    <p className="text-3xl font-bold">4.2</p>
                    <p className="text-xs text-muted-foreground">-2% 先週比</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

