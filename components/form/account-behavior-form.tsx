'use client'

import { Tables } from "@/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"


interface Props {
    accountId: string
    questions: Tables<'questions'>[]
    emailTemplates: Tables<'email_templates'>[]
    actions: Tables<'actions'>[]
}

export default function AccountBehaviorForm({accountId, questions, emailTemplates, actions }: Props) {
    const supabase = createClient()
    const router = useRouter()

    const [calculationQuestionId, setCalculationQuestionId] = useState(actions?.find((action) => action.type === "calculation")?.next_question_id || "")
    const [completionQuestionId, setCompletionQuestionId] = useState(actions?.find((action) => action.type === "complete_notification")?.next_question_id || "")
    const [emailTemplateId, setEmailTemplateId] = useState(actions?.find((action) => action.type === "complete_notification")?.email_template_id || "")
    const [loading, setLoading] = useState(false)

    console.log(calculationQuestionId, completionQuestionId, emailTemplateId)

    const save = async (formData: FormData) => {
        setLoading(true)
        const calculationActionId = actions?.find((action) => action.type === "calculation")?.id
        const completionActionId = actions?.find((action) => action.type === "complete_notification")?.id

        if(!calculationActionId) {
            await supabase.from("actions").insert({
                account_id: accountId,
                type: "calculation",
                next_question_id: calculationQuestionId,
                email_template_id: null,
            })
        } else {
            await supabase.from("actions").update({
                next_question_id: calculationQuestionId,
                email_template_id: null,
            }).eq("id", calculationActionId)
        }

        if(!completionActionId) {
            await supabase.from("actions").insert({
                account_id: accountId,
                type: "complete_notification",
                next_question_id: completionQuestionId,
                email_template_id: emailTemplateId,
            })
        } else {
            await supabase.from("actions").update({
                next_question_id: completionQuestionId,
                email_template_id: emailTemplateId,
            }).eq("id", completionActionId)
        }
        setLoading(false)
    }
    return (
        <div>
            <form action={save}>
                <div className="mb-4">
                    <p>慰謝料計算設定</p>
                    <Label>慰謝料計算を行なう質問</Label>
                    <Select name="calculation_question" defaultValue={calculationQuestionId} onValueChange={setCalculationQuestionId}>
                        <SelectTrigger id="calculation_question">
                            <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {questions.map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                    {q.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <p>回答完了通知設定</p>
                    <Label>完了を行なう質問</Label>
                    <Select name="complete_question" defaultValue={completionQuestionId} onValueChange={setCompletionQuestionId}>
                        <SelectTrigger id="complete_question">
                            <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {questions.map((q) => (
                                <SelectItem key={q.id} value={q.id}>
                                    {q.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mb-4">
                    <Label>送信するメール</Label>
                    <Select name="email_template" defaultValue={emailTemplateId} onValueChange={setEmailTemplateId}>
                        <SelectTrigger id="email_template">
                            <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {emailTemplates.map((temp) => (
                                <SelectItem key={temp.id} value={temp.id}>
                                    {temp.subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "保存中..." : "保存"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
