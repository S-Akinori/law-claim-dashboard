"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertEmailTemplates = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const insertedData = {
        account_id: prevState.account_id,
        subject: formData.get("subject")!.toString(),
        body: formData.get("body")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("email_templates")
        .insert(insertedData)
    if (error) {
        console.error("メールテンプレート登録エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/email-templates`)
}

export const updateEmailTemplates = async (prevState: any, formData: FormData) => {
    const supabaseAdmin = await createClient()

    const updatedData = {
        subject: formData.get("subject")!.toString(),
        body: formData.get("body")!.toString(),
    }

    const { error } = await supabaseAdmin
        .from("email_templates")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        console.error("メールテンプレート更新エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${prevState.account_id}/email-templates`)
}

export const deleteEmailTemplates = async (prevState: any) => {
    const supabaseAdmin = await createClient()

    const {data, error } = await supabaseAdmin
        .from("email_templates")
        .delete()
        .eq("id", prevState.id)
        .select("account_id")

    if (error) {
        console.error("メールテンプレート削除エラー:", error)
        return { message: error.message }
    }

    redirect(`/admin/accounts/${data[0].account_id}/email-templates`)
}