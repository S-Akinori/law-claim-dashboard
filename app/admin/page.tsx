"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin-layout"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    accountsCount: 0,
    masterQuestionsCount: 0,
    masterOptionsCount: 0,
    adminsCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // アカウント数
        const { count: accountsCount, error: accountsError } = await supabase
          .from("accounts")
          .select("*", { count: "exact", head: true })

        // マスター質問数
        const { count: masterQuestionsCount, error: masterQuestionsError } = await supabase
          .from("master_questions")
          .select("*", { count: "exact", head: true })

        // マスターオプション数
        const { count: masterOptionsCount, error: masterOptionsError } = await supabase
          .from("master_options")
          .select("*", { count: "exact", head: true })

        // 管理者数
        const { count: adminsCount, error: adminsError } = await supabase
          .from("admins")
          .select("*", { count: "exact", head: true })

        setStats({
          accountsCount: accountsCount || 0,
          masterQuestionsCount: masterQuestionsCount || 0,
          masterOptionsCount: masterOptionsCount || 0,
          adminsCount: adminsCount || 0,
        })
      } catch (error) {
        console.error("統計取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理者ダッシュボード</h1>
          <p className="text-muted-foreground">システム全体の管理と設定を行います</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">アカウント数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "読み込み中..." : stats.accountsCount}</div>
              <p className="text-xs text-muted-foreground">登録されているアカウントの総数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">マスター質問数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "読み込み中..." : stats.masterQuestionsCount}</div>
              <p className="text-xs text-muted-foreground">マスターデータの質問数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">マスターオプション数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "読み込み中..." : stats.masterOptionsCount}</div>
              <p className="text-xs text-muted-foreground">マスターデータの選択肢数</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理者数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "読み込み中..." : stats.adminsCount}</div>
              <p className="text-xs text-muted-foreground">システム管理者の総数</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>管理者パネルへようこそ</CardTitle>
            <CardDescription>このパネルからマスターデータの管理や各種設定を行えます</CardDescription>
          </CardHeader>
          <CardContent>
            <p>左側のメニューから各管理機能にアクセスできます。主な機能は以下の通りです：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>マスター質問：デフォルトの質問データを管理</li>
              <li>マスタールート：デフォルトの質問ルートを管理</li>
              <li>アカウント管理：登録されているアカウントを管理</li>
              <li>管理者管理：システム管理者を管理</li>
              <li>分析：システム全体の利用状況を分析</li>
              <li>設定：システム全体の設定を管理</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

