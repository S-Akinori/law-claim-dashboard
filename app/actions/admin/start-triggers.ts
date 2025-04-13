"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertStartTrigger = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const insertedData = {
        master_question_id: formData.get("master_question_id")!.toString(),
        keyword: formData.get("keyword")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("master_start_triggers")
        .insert(insertedData)
    if (error) {
        console.error("トリガー登録エラー:", error)
        return { message: error.message }
    }

    redirect("/admin/triggers")
}

export const updateStartTrigger = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const updatedData = {
        master_question_id: formData.get("master_question_id")!.toString(),
        keyword: formData.get("keyword")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("master_start_triggers")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        console.error("トリガー更新エラー:", error)
        return { message: error.message }
    }

    redirect("/admin/triggers")
}

export const deleteStartTrigger = async (prevState: any) => {
    const supabaseAdmin = await createClient()

    const { error } = await supabaseAdmin
        .from("master_start_triggers")
        .delete()
        .eq("id", prevState.id)

    if (error) {
        console.error("トリガー削除エラー:", error)
        return { message: error.message }
    }

    redirect("/admin/triggers")
}