import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function LineUsers() {
    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
        console.error("ユーザー情報取得エラー:", userError)
        return <p>ユーザー情報取得エラー</p>
    }

    const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()
    if (accountError) {
        console.error("アカウント情報取得エラー:", accountError)
        return <p>アカウント情報取得エラー: {accountError.message}</p>
    }
    if (!accountData) {
        console.error("アカウント情報が見つかりません")
        return <p>アカウント情報が見つかりません</p>
    }

    const { data: lineUsersData, error: lineUsersError } = await supabase
        .from("line_users")
        .select("*")
        .eq("account_id", accountData.id)

    if (lineUsersError) {
        console.error("ラインユーザー情報取得エラー:", lineUsersError)
        return <p>ラインユーザー情報取得エラー: {lineUsersError.message}</p>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ラインユーザーリスト</h1>
                <p className="text-muted-foreground">LINE Botに登録されているユーザーのリストを確認できます</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>ラインユーザー情報</CardTitle>
                    <CardDescription>現在のラインユーザー情報を確認できます</CardDescription>
                </CardHeader>
                <CardContent>
                    {lineUsersData.length === 0 ? (
                        <p>ラインユーザーが見つかりません</p>
                    ) : (
                        <ul>
                            {lineUsersData.map((user) => (
                                <li key={user.id} className="border-b py-2">
                                    <p>ユーザーID: {user.id}</p>
                                    <p><Link href={`/dashboard/line-users/${user.id}`}>ユーザー名: {user.name}</Link></p>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
