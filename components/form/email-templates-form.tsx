'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/database.types"
import { useActionState } from "react"
import { Textarea } from "../ui/textarea"
import { insertEmailTemplates, updateEmailTemplates } from "@/app/actions/email-templates"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CopyIcon } from "lucide-react"

interface EmailTemplatesFormProps {
    accountId: string
    emailTemplateData?: Tables<"email_templates">
    questionsData: Tables<"questions">[]
}

function EmailTemplatesForm({ accountId, emailTemplateData, questionsData }: EmailTemplatesFormProps) {
    const initialState = emailTemplateData ? {
        id: emailTemplateData.id,
        account_id: emailTemplateData.account_id,
        message: '',
    } : {
        account_id: accountId,
        message: ''
    }
    const [state, formAction, pending] = useActionState(emailTemplateData ? updateEmailTemplates : insertEmailTemplates, initialState)

    const handleCopyQuestionId = (id: string) => {
        navigator.clipboard.writeText(`{answer:${id}}`)
    }

    return (
        <form action={formAction}>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="subject">件名</Label>
                    <Input id="subject" name="subject" defaultValue={emailTemplateData?.subject ?? ''} />
                </div>
                <div>
                    <Label htmlFor="body">本文</Label>
                    <Textarea
                        id="body"
                        placeholder="本文を入力してください"
                        defaultValue={emailTemplateData?.body ?? ''}
                        rows={8}
                        name="body"
                        required
                    />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">以下のプレースホルダーを使用できます：</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{"{answer:質問ID}"} - 特定の質問に対するユーザーの回答</li>
                    </ul>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="questions">
                        <AccordionTrigger>利用可能な質問一覧</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {questionsData.map((question) => (
                                    <div key={question.id} className="border rounded-md p-3 text-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{question.title || question.text}</p>
                                                {question.title && <p className="text-muted-foreground mt-1">{question.text}</p>}
                                                <p className="text-xs text-muted-foreground mt-1">タイプ: {question.type}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyQuestionId(question.id)}
                                                className="h-8 px-2"
                                                type="button"
                                            >
                                                <CopyIcon className="h-4 w-4 mr-1" />
                                                IDをコピー
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            {
                state?.message && (
                    <div className="text-red-500">
                        {state.message}
                    </div>
                )
            }
            <div className="flex justify-end mt-4">
                <Button type="submit" disabled={pending}>
                    {pending ? '保存中' : '保存'}
                </Button>
            </div>
        </form >
    )
}

export default EmailTemplatesForm