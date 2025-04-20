'use client'
import { insertScheduledMessage, updateScheduledMessage } from "@/app/actions/scheduled-messages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/database.types"
import { useActionState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"

interface ScheduledMessageFormProps {
    scheduledMessageData?: Tables<"scheduled_messages">
    accountId: string
}

function ScheduledMessageForm({ scheduledMessageData, accountId }: ScheduledMessageFormProps) {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const initialState = scheduledMessageData ? {
        id: scheduledMessageData.id,
        account_id: scheduledMessageData.account_id,
        message: '',
    } : {
        account_id: accountId,
        message: ''
    }
    const [state, formAction, pending] = useActionState(scheduledMessageData ? updateScheduledMessage : insertScheduledMessage, initialState)
    return (
        <form action={formAction}>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="dayOffset">送信タイミング（登録からの日数）</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="dayOffset"
                            type="number"
                            min="1"
                            name="day_offset"
                            defaultValue={scheduledMessageData?.day_offset ?? 1}
                            className="w-24"
                        />
                        <span>日後</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hour">送信時間</Label>
                    <Select name="hour" defaultValue={scheduledMessageData?.hour.toString() ?? ''}>
                        <SelectTrigger id="hour" className="w-24">
                            <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {hours.map((h) => (
                                <SelectItem key={h} value={h.toString()}>
                                    {h.toString().padStart(2, "0")}:00
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">メッセージ内容</Label>
                    <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        defaultValue={scheduledMessageData?.message ?? ''}
                    />
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

export default ScheduledMessageForm