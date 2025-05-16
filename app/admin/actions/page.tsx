import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import BehaviorForm from "@/components/form/behavior-form"

export default async function TriggersPage() {
  const supabase = await createClient()
  const { data: questions } = await supabase.from("master_questions").select(`*`).order("created_at", { ascending: false })
  const { data: emailTemplates } = await supabase.from("master_email_templates").select(`*`).order("created_at", { ascending: false })
  const { data: actions } = await supabase.from("master_actions").select(`*, master_questions(*)`)

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>アクション設定</CardTitle>
          </CardHeader>
          <CardContent>
            {questions && emailTemplates && actions && (
              <BehaviorForm questions={questions} emailTemplates={emailTemplates} actions={actions} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

