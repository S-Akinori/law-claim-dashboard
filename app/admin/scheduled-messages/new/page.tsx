import AdminScheduledMessageForm from "@/components/form/admin-scheduled-messages-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function NewScheduledMessagePage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">定期メッセージ作成</h1>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
            <AdminScheduledMessageForm />
        </CardContent>
      </Card>
    </div>
  )
}
