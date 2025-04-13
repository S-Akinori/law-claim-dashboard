import { createClient } from "@/lib/supabase/server"
import { Tables } from "@/database.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccountImageActions } from "@/components/account-image-actions"
import Link from "next/link"
import Image from "next/image"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AccountImagesPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: accountData } = await supabase.from("accounts").select("*").eq("id", id).single()

    if (!accountData) {
        return <p>アカウント情報が見つかりません</p>
    }

    const { data: options } = await supabase
        .from("master_options")
        .select("*, master_questions(*)")
        .order("created_at", { ascending: true })

    const { data: optionImages } = await supabase
        .from("option_images")
        .select("*, images (*), master_options(*, master_questions(*))")
        .eq("account_id", accountData.id)
        .order("created_at", { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">画像管理</h1>
                    <p className="text-muted-foreground">
                        LINEボットで使用する画像を管理します。マスターオプションに画像を関連付けることができます。
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>画像一覧</CardTitle>
                    <CardDescription>LINEボットで使用する画像の一覧です</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>画像</TableHead>
                                <TableHead>関連する質問＆オプション</TableHead>
                                <TableHead>作成日</TableHead>
                                <TableHead>操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {options?.map((option) => {
                                const relatedImage = optionImages?.find((oi) => oi.master_option_id === option.id)

                                return (
                                    <TableRow key={option.id}>
                                        <TableCell>
                                            {relatedImage?.images?.url && (
                                                <Link
                                                    href={relatedImage.images.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Image
                                                        src={relatedImage.images.url}
                                                        alt=""
                                                        width={150}
                                                        height={150}
                                                    />
                                                </Link>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {option.master_questions.title} : 【{option.text}】
                                        </TableCell>
                                        <TableCell>
                                            {new Date(option.created_at).toLocaleDateString("ja-JP")}
                                        </TableCell>
                                        <TableCell>
                                            <AccountImageActions
                                                option={option}
                                                optionImage={relatedImage}
                                                image={relatedImage?.images}
                                                account={accountData}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
