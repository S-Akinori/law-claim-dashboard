'use client'
import { insertStartTrigger, updateStartTrigger } from "@/app/actions/start-triggers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/database.types"
import { useActionState } from "react"

interface StartTriggerFormProps {
    accountId: string
    triggerData?: Tables<"start_triggers">
    questionsData: Tables<"questions">[]
}

function StartTriggerForm({accountId, triggerData, questionsData }: StartTriggerFormProps) {
    const initialState = triggerData ? {
        id: triggerData.id,
        account_id: triggerData.account_id,
        message: '',
    } : {
        account_id: accountId,
        message: ''
    }
    const [state, formAction, pending] = useActionState(triggerData ? updateStartTrigger : insertStartTrigger, initialState)
    return (
        <form action={formAction}>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="keyword">キーワード</Label>
                    <Input id="keyword" name="keyword" defaultValue={triggerData?.keyword ?? ''} />
                </div>
                <div>
                    <Label htmlFor="question">開始質問</Label>
                    <select id="question" name="question_id" defaultValue={triggerData?.question_id ?? ''} className="w-full p-2 border rounded-md">
                        {questionsData.map((question) => (
                            <option key={question.id} value={question.id}>
                                {question.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {state?.message && (
                <div className="text-red-500">
                    {state.message}
                </div>
            )}
            <div className="flex justify-end mt-4">
                <Button type="submit" disabled={pending}>
                    {pending ? '保存中' : '保存'}
                </Button>
            </div>
        </form>
    )
}

export default StartTriggerForm