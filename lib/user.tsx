import { createClient } from "./supabase/client"

export const getUser = async () => {
    const supabase = createClient()
    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        return
    }

    return userData

}