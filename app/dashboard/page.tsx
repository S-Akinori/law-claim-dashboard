import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart3, MessageSquare, Users } from "lucide-react"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">LINE Bot管理システムの概要を確認できます</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">総質問数</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 先週から</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">145</div>
              <p className="text-xs text-muted-foreground">+22 先月から</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">総回答数</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+89 先週から</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>最近の活動</CardTitle>
              <CardDescription>システムの最近の活動履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">新しい質問が追加されました</p>
                    <p className="text-xs text-muted-foreground">2時間前</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">ユーザーが新規登録しました</p>
                    <p className="text-xs text-muted-foreground">5時間前</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">質問フローが更新されました</p>
                    <p className="text-xs text-muted-foreground">1日前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使う機能へのショートカット</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                  <h3 className="font-medium mb-1">質問を追加</h3>
                  <p className="text-xs text-muted-foreground">新しい質問を作成します</p>
                </div>
                <div className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                  <h3 className="font-medium mb-1">フロー編集</h3>
                  <p className="text-xs text-muted-foreground">質問フローを編集します</p>
                </div>
                <div className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                  <h3 className="font-medium mb-1">LINE設定</h3>
                  <p className="text-xs text-muted-foreground">LINEチャンネル設定を変更します</p>
                </div>
                <div className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer">
                  <h3 className="font-medium mb-1">回答確認</h3>
                  <p className="text-xs text-muted-foreground">ユーザーの回答を確認します</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

