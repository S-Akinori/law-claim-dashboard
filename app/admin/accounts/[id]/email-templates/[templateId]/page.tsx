import DeleteEmailTemplateForm from "@/components/form/delete-email-templates-form"
import DeleteStartTriggerForm from "@/components/form/delete-start-triggers-form"
import EmailTemplatesForm from "@/components/form/email-templates-form"
import StartTriggerForm from "@/components/form/start-triggers-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/server"
import { Trash2 } from "lucide-react"
import { notFound } from "next/navigation"

interface EditEmailTemplatesPageProps {
    params: {
        id: string
        templateId: string
    }
}

export default async function EditEmailTemplatesPage({ params }: EditEmailTemplatesPageProps) {
    const { id: accountId, templateId } = params
    const supabase = await createClient()
    const { data: emailTemplateData, error: triggerError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", templateId)
        .single()

    if (triggerError || !emailTemplateData) {
        console.error("トリガー情報取得エラー:", triggerError)
        notFound()
    }

    const { data: questionsData, error: questionsError } = await supabase.from("questions").select("*").eq("account_id", accountId)

    if (questionsError) {
        console.error("質問情報取得エラー:", questionsError)
        notFound()
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">メールテンプレート編集</h1>
                    <p className="text-muted-foreground">特定のキーワードで開始する質問を編集します</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>削除してよろしいですか？</DialogTitle>
                        <div className="flex items-center gap-4 justify-center py-6 text-center">
                            <DialogClose asChild>
                                <Button variant="outline">
                                    キャンセル
                                </Button>
                            </DialogClose>
                            <DeleteEmailTemplateForm templateId={emailTemplateData.id} />
                        </div>
                    </DialogContent>
                </Dialog>
                <Card>
                    <CardHeader>
                        <CardTitle>メールテンプレート情報</CardTitle>
                        <CardDescription>メールテンプレートの詳細を編集します</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmailTemplatesForm accountId={accountId} emailTemplateData={emailTemplateData} questionsData={questionsData} />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
