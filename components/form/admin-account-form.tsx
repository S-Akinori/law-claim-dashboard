'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { use, useActionState } from "react"
import { registerUser, updateAccount } from "@/app/actions/admin/accounts"
import { Tables } from "@/database.types"
import { Textarea } from "../ui/textarea"

interface Props {
    accountData?: Tables<'accounts'>
}

export default function AdminAccountForm({ accountData }: Props) {
    const initialState = accountData ? {
        user_id: accountData.user_id,
        message: '',
    } : {
        message: '',
    }
    const [state, formAction, pending] = useActionState(accountData ? updateAccount : registerUser, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <Label>メールアドレス</Label>
                <Input name="email" required defaultValue={accountData?.email ?? ''} />
            </div>
            {!accountData && (
                <div>
                    <Label>パスワード</Label>
                    <Input type="password" name="password" required />
                </div>
            )}
            <div>
                <Label>アカウント名</Label>
                <Input name="name" required defaultValue={accountData?.name ?? ''} />
            </div>
            <div>
                <Label>電話番号</Label>
                <Input name="tel" required defaultValue={accountData?.tel ?? ''} />
            </div>
            <div>
                <Label>営業時間</Label>
                <Input name="hours" required defaultValue={accountData?.hours ?? ''} />
            </div>
            <div>
                <Label>LINE Channel ID</Label>
                <Input name="line_channel_id" required defaultValue={accountData?.line_channel_id ?? ''} />
            </div>
            <div>
                <Label>LINE Channel Secret</Label>
                <Input name="line_channel_secret" required defaultValue={accountData?.line_channel_secret ?? ''} />
            </div>
            <div>
                <Label>LINE Channel Access Token</Label>
                <Input name="line_channel_access_token" required defaultValue={accountData?.line_channel_access_token ?? ''} />
            </div>
            {accountData && (
                <div>
                    <Label>通知用メール（改行で複数追加）</Label>
                    <Textarea name="sub_emails" rows={3} defaultValue={accountData?.sub_emails.join('\n') ?? ''} />
                </div>
            )}
            {state?.message && (
                <div className="text-red-500">
                    {state.message}
                </div>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? '保存中' : '保存'}
            </Button>
        </form>
    )
}