import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">交通事故慰謝料計算 - 管理パネル</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">LINE Bot管理システム</h2>
          <p className="text-xl text-muted-foreground">
            交通事故慰謝料計算のためのLINE Botを簡単に管理できるダッシュボードへようこそ。
            質問フローの作成、編集、ユーザー回答の分析などが行えます。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg">
              <Link href="/login">
                ログイン
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">質問フロー管理</h3>
              <p className="text-muted-foreground">質問の作成、編集、条件分岐の設定を行います</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">LINE Bot設定</h3>
              <p className="text-muted-foreground">チャンネルIDや認証情報の管理を行います</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="font-bold text-lg mb-2">回答データ分析</h3>
              <p className="text-muted-foreground">ユーザーからの回答データを閲覧・分析できます</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} 交通事故慰謝料計算システム
        </div>
      </footer>
    </div>
  )
}

