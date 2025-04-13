import AdminDeleteStartTriggerForm from "@/components/form/admin-delete-start-triggers-form"
import AdminStartTriggerForm from "@/components/form/admin-start-triggers-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/server"
import { Trash2 } from "lucide-react"
import { notFound } from "next/navigation"

export default async function EditTriggerPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: triggerData, error: triggerError } = await supabase
        .from("master_start_triggers")
        .select("*")
        .eq("id", params.id)
        .single()

    if (triggerError || !triggerData) {
        console.error("トリガー情報取得エラー:", triggerError)
        notFound()
    }

    const { data: questionsData, error: questionsError } = await supabase.from("master_questions").select("*")

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
                            <AdminDeleteStartTriggerForm triggerId={triggerData.id} />
                        </div>
                    </DialogContent>
                </Dialog>
                <Card>
                    <CardHeader>
                        <CardTitle>トリガー情報</CardTitle>
                        <CardDescription>トリガーの詳細を編集します</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminStartTriggerForm triggerData={triggerData} questionsData={questionsData} />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
