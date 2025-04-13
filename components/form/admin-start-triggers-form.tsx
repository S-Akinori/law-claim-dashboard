'use client'
import { insertStartTrigger, updateStartTrigger } from "@/app/actions/admin/start-triggers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/database.types"
import { useActionState } from "react"

interface AdminStartTriggerFormProps {
    triggerData?: Tables<"master_start_triggers">
    questionsData: Tables<"master_questions">[]
}

function AdminStartTriggerForm({ triggerData, questionsData }: AdminStartTriggerFormProps) {
    const initialState = triggerData ? {
        id: triggerData.id,
        message: '',
    } : {
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
                    <select id="question" name="master_question_id" defaultValue={triggerData?.master_question_id ?? ''} className="w-full p-2 border rounded-md">
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

export default AdminStartTriggerForm