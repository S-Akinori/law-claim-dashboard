"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const changeMasterMode = async (prevState: any, formData: FormData) => {
    const supabase = await createClient()
    const accountId = prevState.accountId

    // 1. accountsテーブルのuse_masterを更新
    const { error: accountError } = await supabase
        .from("accounts")
        .update({ use_master: true })
        .eq("id", accountId)

    if (accountError) {
        return { message: `アカウントの更新に失敗しました: ${accountError.message}` }
    }

    redirect(`/admin/accounts/${accountId}`)
}