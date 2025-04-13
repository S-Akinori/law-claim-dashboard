'use client'

import { updateAccount } from "@/app/actions/accounts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tables } from "@/database.types"
import { use, useActionState } from "react"

interface Props {
    accountData: Tables<'accounts'>
}

export default function AccountForm({ accountData }: Props) {
    const initialState = {
        user_id: accountData.user_id,
        message: '',
    }
    const [state, formAction, pending] = useActionState(updateAccount, initialState)
    return (
        <form action={formAction}>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">アカウント名</Label>
                    <Input id="name" name="name" defaultValue={accountData.name} />
                </div>
                <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" name="email" type="email" defaultValue={accountData.email ?? ''} />
                </div>
                <div>
                    <Label htmlFor="line_channel_secret">ラインチャンネルシークレット</Label>
                    <Input id="line_channel_secret" name="line_channel_secret" defaultValue={accountData.line_channel_secret} />
                </div>
                <div>
                    <Label htmlFor="line_channel_access_token">ラインチャンネルアクセストークン</Label>
                    <Input id="line_channel_access_token" name="line_channel_access_token" defaultValue={accountData.line_channel_access_token} />
                </div>
                <div>
                    <Label htmlFor="tel">電話番号</Label>
                    <Input id="tel" name="tel" type="tel" defaultValue={accountData.tel ?? ''} />
                </div>
                <div>
                    <Label htmlFor="hours">営業時間</Label>
                    <Input id="hours" name="hours" defaultValue={accountData.hours ?? ''} />
                </div>
                <Button type="submit" disabled={pending}>{pending ? '更新中' : '保存'}</Button>
                {state?.message && (
                    <div className="text-red-500">
                        {state.message}
                    </div>
                )}
            </div>
        </form>
    )
}
