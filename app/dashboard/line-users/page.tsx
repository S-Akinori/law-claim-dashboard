import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Tables } from "@/database.types"

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

    const excludedIds = [
        "67ac9580-6a72-4214-8fd1-c83dc49e1bd5",
        "51cd09b8-1c37-4773-a85a-61b43018c047",
        "f38d4ad5-aa04-42ea-876c-1cca4bfe3cb7",
        "006b7220-ab96-4d81-a549-55c611846f85",
        "1136f949-dde8-403a-8bc0-e65505242078"
    ]

    const { data: questionsData, error: questionsError } = await supabase
        .from("master_questions")
        .select("*")
        .not("id", "in", `(${excludedIds.join(",")})`)


    const { data: routesData, error: routesError } = await supabase
        .from("master_question_routes")
        .select("from_master_question_id, next_master_question_id")

    const { data: triggers } = await supabase
        .from("master_start_triggers")
        .select("master_question_id")
        .order("created_at", { ascending: true })

    const startIds = triggers?.map(t => t.master_question_id) || []

    const questionOrder = buildQuestionOrderFromRoutesWithQuestions(routesData, startIds, questionsData)

    console.log("questionOrder", questionOrder)

    const { data: lineUsersData, error: lineUsersError } = await supabase
        .from("line_users")
        .select("*, user_responses(*, master_questions(*))")
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
                        <div className="overflow-x-auto">

                            <Table >
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[120px] max-w-[180px] truncate text-xs">ユーザー名</TableHead>
                                        <TableHead className="min-w-[120px] max-w-[180px] truncate text-xs">最終回答日</TableHead>
                                        {questionOrder?.map((q) => (
                                            <TableHead
                                                key={q.id}
                                                className="min-w-[120px] max-w-[180px] truncate text-xs"
                                                title={q.title} // hoverで全体表示
                                            >{q.title}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineUsersData.map((user) => {
                                        const responseMap = new Map(
                                            user.user_responses.map((r) => [r.master_question_id, r.response])
                                        )

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Link href={`/dashboard/line-users/${user.id}`} className="font-medium text-blue-600">
                                                        {user.name || user.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "-"}</TableCell>
                                                {questionOrder.map((question) => (
                                                    <TableCell key={question.id}>{responseMap.get(question.id) || "-"}</TableCell>
                                                ))}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function buildQuestionOrderFromRoutesWithQuestions(
    routes: { from_master_question_id: string; next_master_question_id: string }[],
    startIds: string[],
    questions: Tables<"master_questions">[]
): Tables<"master_questions">[] {
    const ordered: Tables<"master_questions">[] = []
    const visited = new Set<string>()

    for (const startId of startIds) {
        let currentId = startId
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId)
            const question = questions.find((q) => q.id === currentId)
            if (question) ordered.push(question)

            const nextRoute = routes.find((r) => r.from_master_question_id === currentId)
            if (!nextRoute) break
            currentId = nextRoute.next_master_question_id
        }
    }

    return ordered
}
