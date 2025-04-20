import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function LineUser({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (!authData || authError) {
        console.error("ユーザー情報取得エラー:", authError)
        return <p>ユーザー情報取得エラー</p>
    }

    const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", authData.user.id)
        .single()

    if (!accountData || accountError) {
        console.error("アカウント情報取得エラー:", accountError)
        return <p>アカウント情報取得エラー: {accountError.message}</p>
    }

    const { data: userData, error: userError } = await supabase
        .from("line_users")
        .select("*, user_responses(*, master_questions(*))")
        .eq("id", params.id)
        .eq("account_id", accountData.id)
        .single()

    if (userError || !userData) {
        console.error("ユーザー情報取得エラー:", userError)
        return <p>ユーザー情報取得エラー: {userError?.message}</p>
    }

    const { data: routesData, error: routesError } = await supabase
        .from("master_question_routes")
        .select("from_master_question_id, next_master_question_id")

    const { data: triggers } = await supabase
        .from("master_start_triggers")
        .select("master_question_id")
        .order("created_at", { ascending: true })

    const startIds = triggers?.map(t => t.master_question_id) || []


    const sortedResponses = sortResponsesByRouteMultiple(
        userData.user_responses,
        routesData, // 予め Supabase から取得したルートデータ
        startIds
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ユーザー情報</h1>
                <p className="text-muted-foreground">ユーザーの詳細情報と質問の回答結果を確認できます</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>ユーザー情報</CardTitle>
                    <CardDescription>ユーザーの詳細情報</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>ユーザーID: {userData.id}</p>
                    <p>ユーザー名: {userData.name}</p>
                    <p>ユーザーの回答状態: {userData.is_answer_complete ? '回答完了' : '未完了'}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>質問の回答結果</CardTitle>
                    <CardDescription>ユーザーの質問に対する回答結果</CardDescription>
                </CardHeader>
                <CardContent>
                    {userData.user_responses.length === 0 ? (
                        <p>質問の回答結果が見つかりません</p>
                    ) : (
                        <ul>
                            {sortedResponses.map((response) => (
                                <li key={response.id} className="border-b py-2">
                                    <p>質問: {response.master_questions?.title}</p>
                                    <p>回答: {response.response}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function sortResponsesByRouteMultiple(
    responses: any[],
    questionRoutes: { from_master_question_id: string, next_master_question_id: string }[],
    startIds: string[]
  ): any[] {
    const responseMap = new Map(responses.map((r) => [r.master_question_id, r]));
    const visited = new Set<string>();
    const sorted: any[] = [];
  
    for (const startId of startIds) {
      let currentId = startId;
  
      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const res = responseMap.get(currentId);
        if (res) sorted.push(res);
  
        const next = questionRoutes.find((r) => r.from_master_question_id === currentId);
        if (!next) break;
  
        currentId = next.next_master_question_id;
      }
    }
  
    return sorted;
  }
  