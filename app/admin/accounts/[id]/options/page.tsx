import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface QuestionsPageProps {
    params: {
        id: string
    }
}

export default async function AccountOptionListPage({ params }: QuestionsPageProps) {
    const { id: accountId } = params
    const supabase = await createClient()
    const { data: accountOptions, error } = await supabase
    .from("account_options")
    .select("id, text, image_url, master_options(text, master_questions(title))")
    .eq("account_id", accountId)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">アカウント選択肢一覧</h1>
                <Button asChild>
                    <Link href={`/admin/accounts/${accountId}/options/new`}>+ 新規作成</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>選択肢一覧</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>質問</TableHead>
                                <TableHead>マスター選択肢</TableHead>
                                <TableHead>上書きテキスト</TableHead>
                                <TableHead>画像</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accountOptions?.map((opt) => (
                                <TableRow key={opt.id}>
                                    <TableCell>{opt.master_options?.master_questions?.title || "-"}</TableCell>
                                    <TableCell>{opt.master_options?.text || "-"}</TableCell>
                                    <TableCell>{opt.text || "-"}</TableCell>
                                    <TableCell>
                                        {opt.image_url ? (
                                            <img src={opt.image_url} alt="img" className="h-12 w-auto object-cover border rounded" />
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
