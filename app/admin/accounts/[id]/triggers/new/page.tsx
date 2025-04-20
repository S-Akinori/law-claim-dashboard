import StartTriggerForm from "@/components/form/start-triggers-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface NewTriggerPageProps {
  params: {
    id: string
  }
}

export default async function NewTriggerPage({ params }: NewTriggerPageProps) {
  const { id: accountId } = params
  const supabase = await createClient()

  const { data: questionsData, error: questionsError } = await supabase.from("questions").select("*").eq("account_id", accountId)

  if (questionsError) {
    console.error("質問情報取得エラー:", questionsError)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">スタートトリガー作成</h1>
        <p className="text-muted-foreground">特定のキーワードで開始する質問を作成します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>トリガー情報</CardTitle>
          <CardDescription>トリガーの詳細を作成します</CardDescription>
        </CardHeader>
        <CardContent>
            <StartTriggerForm accountId={accountId} questionsData={questionsData} />
        </CardContent>
      </Card>
    </div>
  )
}
