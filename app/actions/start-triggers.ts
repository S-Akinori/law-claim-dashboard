"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertStartTrigger = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const insertedData = {
        account_id: prevState.account_id,
        question_id: formData.get("question_id")!.toString(),
        keyword: formData.get("keyword")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("start_triggers")
        .insert(insertedData)
    if (error) {
        console.error("トリガー登録エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/triggers`)
}

export const updateStartTrigger = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const updatedData = {
        question_id: formData.get("question_id")!.toString(),
        keyword: formData.get("keyword")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("start_triggers")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        console.error("トリガー更新エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/triggers`)
}

export const deleteStartTrigger = async (prevState: any) => {
    const supabaseAdmin = await createClient()

    const {data, error } = await supabaseAdmin
        .from("start_triggers")
        .delete()
        .eq("id", prevState.id)
        .select("account_id")

    if (error) {
        console.error("トリガー削除エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${data[0].account_id}/triggers`)
}