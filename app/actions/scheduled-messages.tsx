"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const insertScheduledMessage = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const insertedData = {
        account_id: prevState.account_id,
        day_offset: parseInt(formData.get("day_offset")!.toString()),
        hour: parseInt(formData.get("hour")!.toString()),
        message: formData.get("message")!.toString(),
    }

    const {error } = await supabaseAdmin
        .from("scheduled_messages")
        .insert(insertedData)
    if (error) {
        console.error("スケジュールメッセージ登録エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/scheduled-messages`)
}

export const updateScheduledMessage = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const updatedData = {
        day_offset: parseInt(formData.get("day_offset")!.toString()),
        hour: parseInt(formData.get("hour")!.toString()),
        message: formData.get("message")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("scheduled_messages")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        console.error("スケジュールメッセージ更新エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/scheduled-messages`)
}

export const deleteScheduledMessage = async (prevState: any) => {
    const supabaseAdmin = await createClient()

    const {data, error } = await supabaseAdmin
        .from("scheduled_messages")
        .delete()
        .eq("id", prevState.id)
        .select("account_id")

    if (error) {
        console.error("スケジュールメッセージ削除エラー:", error)
        return { message: error.message }
    } else {
        redirect(`/admin/accounts/${data[0].account_id}/scheduled-messages`)
    }
}