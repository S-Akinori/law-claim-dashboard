import AdminScheduledMessageForm from "@/components/form/admin-scheduled-messages-form"
import ScheduledMessageForm from "@/components/form/scheduled-messages-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ScheduledMessagePageProps {
  params: {
    id: string
  }
}

export default async function NewScheduledMessagePage({ params }: ScheduledMessagePageProps) {
  const { id } = params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">定期メッセージ作成</h1>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
            <ScheduledMessageForm accountId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
