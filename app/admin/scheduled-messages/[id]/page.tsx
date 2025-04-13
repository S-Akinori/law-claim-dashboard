import AdminDeleteScheduledMessageForm from "@/components/form/admin-delete-scheduled-messages-form"
import AdminScheduledMessageForm from "@/components/form/admin-scheduled-messages-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/server"
import { Trash2 } from "lucide-react"

interface PageProps {
    params: Promise<{ id: string }>
}


export default async function EditScheduledMessagePage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: scheduledMessageData, error: scheduledMessageError } = await supabase
        .from("master_scheduled_messages")
        .select("*")
        .eq("id", id)
        .single()

    if (!scheduledMessageData || scheduledMessageError) {
        console.error("定期メッセージ情報取得エラー:", scheduledMessageError)
        return <p>定期メッセージ情報取得エラー: {scheduledMessageError.message}</p>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">定期メッセージ編集</h1>
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
                        <AdminDeleteScheduledMessageForm id={scheduledMessageData.id} />
                    </div>
                </DialogContent>
            </Dialog>
            <Card>
                <CardHeader>
                    <CardTitle>定期メッセージ情報</CardTitle>
                    <CardDescription>定期メッセージの詳細を編集します</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminScheduledMessageForm scheduledMessageData={scheduledMessageData} />
                </CardContent>
            </Card>
        </div>
    )
}
