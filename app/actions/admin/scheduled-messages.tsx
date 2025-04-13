"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertScheduledMessage = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const insertedData = {
        day_offset: parseInt(formData.get("day_offset")!.toString()),
        hour: parseInt(formData.get("hour")!.toString()),
        message: formData.get("message")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("master_scheduled_messages")
        .insert(insertedData)
    if (error) {
        console.error("スケジュールメッセージ登録エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/scheduled-messages`)
}

export const updateScheduledMessage = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const updatedData = {
        day_offset: parseInt(formData.get("day_offset")!.toString()),
        hour: parseInt(formData.get("hour")!.toString()),
        message: formData.get("message")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("master_scheduled_messages")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        console.error("スケジュールメッセージ更新エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/scheduled-messages`)
}

export const deleteScheduledMessage = async (prevState: any) => {
    const supabaseAdmin = await createClient()

    const { error } = await supabaseAdmin
        .from("master_scheduled_messages")
        .delete()
        .eq("id", prevState.id)

    if (error) {
        console.error("スケジュールメッセージ削除エラー:", error)
        return { message: error.message }
    } else {
        redirect(`/admin/scheduled-messages`)
    }
}