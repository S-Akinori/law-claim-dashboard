import DeleteStartTriggerForm from "@/components/form/delete-start-triggers-form"
import StartTriggerForm from "@/components/form/start-triggers-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/server"
import { Trash2 } from "lucide-react"
import { notFound } from "next/navigation"

interface EditTriggerPageProps {
    params: {
        id: string
        triggerId: string
    }
}

export default async function EditTriggerPage({ params }: EditTriggerPageProps) {
    const { id: accountId, triggerId } = params
    const supabase = await createClient()
    const { data: triggerData, error: triggerError } = await supabase
        .from("start_triggers")
        .select("*")
        .eq("id", triggerId)
        .single()

    if (triggerError || !triggerData) {
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
                    <h1 className="text-3xl font-bold tracking-tight">スタートトリガー編集</h1>
                    <p className="text-muted-foreground">特定のキーワードで開始する質問を編集します</p>
                </div>
                <Dialog>
                    <DialogTrigger>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>削除してよろしいですか？</DialogTitle>
                        <div className="flex items-center gap-4 justify-center py-6 text-center">
                            <DialogClose>
                                <Button variant="outline">
                                    キャンセル
                                </Button>
                            </DialogClose>
                            <DeleteStartTriggerForm triggerId={triggerData.id} />
                        </div>
                    </DialogContent>
                </Dialog>
                <Card>
                    <CardHeader>
                        <CardTitle>トリガー情報</CardTitle>
                        <CardDescription>トリガーの詳細を編集します</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StartTriggerForm accountId={accountId} triggerData={triggerData} questionsData={questionsData} />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
