"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertQuestion = async (prevState: any, formData: FormData) => {
    const supabase = await createClient()
    const insertedData = {
        title: formData.get("title")!.toString(),
        text: formData.get("text")!.toString(),
        type: formData.get("type")!.toString(),
    }

    const { data, error } = await supabase.from("master_questions").insert(insertedData)

    if (error) {
        return { message: "質問の登録に失敗しました" }
    }

    redirect(`/admin/questions`)
}

export const updateQuestion = async (prevState: any, formData: FormData) => {
    const supabase = await createClient()
    const updatedData = {
        title: formData.get("title")!.toString(),
        text: formData.get("text")!.toString(),
        type: formData.get("type")!.toString(),
    }

    const { error } = await supabase
        .from("master_questions")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        return { message: "質問の更新に失敗しました" }
    }

    redirect(`/admin/questions`)
}
