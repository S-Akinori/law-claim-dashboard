import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/server"
import MasterQuestionTable from "@/components/master-question-table"
import QuestionTable from "@/components/question-table"

interface QuestionsPageProps {
    params: {
        id: string
    }
}

export default async function QuestionsPageProps({ params }: QuestionsPageProps) {
    const { id } = params
    const supabase = await createClient()
    const { data: questionsData, error: questionsError } = await supabase.from("questions").select(`*`).eq("account_id", params.id).order("created_at", { ascending: false })

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">質問管理</h1>
                        <p className="text-muted-foreground">質問の作成、編集、削除を行います</p>
                    </div>
                    <Button asChild>
                        <Link href={`/admin/accounts/${id}/questions/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            新規質問
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>質問一覧</CardTitle>
                        <CardDescription>システムに登録されている質問の一覧です</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!questionsData && (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <p className="mb-2 text-muted-foreground">質問がまだ登録されていません</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/accounts/${id}/questions/new`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        最初の質問を作成
                                    </Link>
                                </Button>
                            </div>
                        )}
                        {questionsData && (
                            <QuestionTable questionsData={questionsData} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
