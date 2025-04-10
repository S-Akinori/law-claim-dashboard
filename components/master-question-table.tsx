'use client'

import React from 'react';
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"
import { Database, Tables, Enums } from "@/database.types";

interface MasterQuestionTableProps {
    questionsData: Tables<'master_questions'>[];
}

const MasterQuestionTable = ({ questionsData }: MasterQuestionTableProps) => {
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()
    const handleDeleteQuestion = async (id: string) => {
        try {
            const { error } = await supabase.from("master_questions").delete().eq("id", id)

            if (error) {
                toast({
                    variant: "destructive",
                    title: "削除エラー",
                    description: "質問の削除に失敗しました",
                })
                return
            }

            toast({
                title: "質問を削除しました",
                description: "質問が正常に削除されました",
            })

            // 質問リストを更新
            router.push("/admin/questions")
            router.refresh()
        } catch (error) {
            console.error("削除エラー:", error)
            toast({
                variant: "destructive",
                title: "エラーが発生しました",
                description: "質問の削除中にエラーが発生しました",
            })
        }
    }

    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case "text":
                return "テキスト"
            case "image_carousel":
                return "画像カルーセル"
            case "button":
                return "ボタン"
            default:
                return type
        }
    }

    const getQuestionTypeBadgeVariant = (type: string) => {
        switch (type) {
            case "text":
                return "default"
            case "image_carousel":
                return "secondary"
            case "button":
                return "outline"
            default:
                return "default"
        }
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>質問内容</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>選択肢数</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questionsData.map((question) => (
                    <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.title || "（タイトルなし）"}</TableCell>
                        <TableCell className="max-w-xs truncate">{question.text}</TableCell>
                        <TableCell>
                            <Badge variant={getQuestionTypeBadgeVariant(question.type)}>
                                {getQuestionTypeLabel(question.type)}
                            </Badge>
                        </TableCell>
                        <TableCell>{question.options_count}</TableCell>
                        <TableCell>{question.created_at ? new Date(question.created_at).toLocaleDateString("ja-JP") : "日付不明"}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">メニューを開く</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/questions/${question.id}`}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            編集
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        削除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default MasterQuestionTable;