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
import { Tables } from "@/database.types";

interface QuestionTableProps {
    questionsData: Tables<'questions'>[];
}

const QuestionTable = ({ questionsData }: QuestionTableProps) => {
    const router = useRouter()
    const supabase = createClient()
    const handleDeleteQuestion = async (id: string) => {
        try {
            const { error } = await supabase.from("questions").delete().eq("id", id)

            if (error) {
                return
            }

            // 質問リストを更新
            router.push(`/admin/accounts/${questionsData[0].account_id}/questions`)
            router.refresh()
        } catch (error) {
            console.error("削除エラー:", error)
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
                                        <Link href={`/admin/accounts/${question.account_id}/questions/${question.id}`}>
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

export default QuestionTable;