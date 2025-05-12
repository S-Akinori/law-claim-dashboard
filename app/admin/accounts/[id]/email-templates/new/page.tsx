import EmailTemplatesForm from "@/components/form/email-templates-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"


interface NewEmailTemplatesPageProps {
  params: {
    id: string
  }
}

export default async function NewEmailTemplatesPage({ params }: NewEmailTemplatesPageProps) {
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
        <h1 className="text-3xl font-bold tracking-tight">メールテンプレート作成</h1>
        <p className="text-muted-foreground">メールテンプレートを作成します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メールテンプレート情報</CardTitle>
          <CardDescription>メールテンプレートの詳細を作成します</CardDescription>
        </CardHeader>
        <CardContent>
            <EmailTemplatesForm accountId={accountId} questionsData={questionsData} />
        </CardContent>
      </Card>
    </div>
  )
}
