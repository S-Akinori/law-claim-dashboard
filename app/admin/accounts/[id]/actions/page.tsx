import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import BehaviorForm from "@/components/form/behavior-form"
import AccountBehaviorForm from "@/components/form/account-behavior-form"

interface TriggersPageProps {
  params: {
    id: string
  }
}
export default async function TriggersPage({ params }: TriggersPageProps) {
  const { id: accountId } = params

  const supabase = await createClient()
  const { data: questions } = await supabase.from("questions").select(`*`).eq('account_id', accountId).order("created_at", { ascending: false })
  const { data: emailTemplates } = await supabase.from("email_templates").select(`*`).eq('account_id', accountId).order("created_at", { ascending: false })
  const { data: actions } = await supabase.from("actions").select(`*, questions(*)`).eq('account_id', accountId)

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>アクション設定</CardTitle>
          </CardHeader>
          <CardContent>
            {questions && emailTemplates && actions && (
              <AccountBehaviorForm accountId={accountId} questions={questions} emailTemplates={emailTemplates} actions={actions} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

