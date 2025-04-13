"use server"

import { createClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"

export const insertOptionImage = async (prevState: any, formData: FormData) => {
    const supabase = await createClient()
    const insertedData = {
        account_id: prevState.account_id,
        master_option_id: formData.get("option_id")!.toString(),
        image_id: formData.get("image_id")!.toString(),
    }
    
    const { data, error } = await supabase.from("option_images").insert(insertedData)

    if (error) {
        return { message: "画像の設定に失敗しました" }
    }
    
    redirect(`/admin/accounts/${prevState.account_id}/images`)
}

export const updateOptionImage = async (prevState: any, formData: FormData) => {
    const supabase = await createClient()
    const updatedData = {
        image_id: formData.get("image_id")!.toString(),
    }
    
    const { error } = await supabase
        .from("option_images")
        .update(updatedData)
        .eq("id", prevState.id)

    if (error) {
        return { message: "画像の更新に失敗しました" }
    }

    redirect(`/admin/accounts/${prevState.account_id}/images`)
}