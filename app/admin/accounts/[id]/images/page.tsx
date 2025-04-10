"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Link2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ImageDialog } from "@/components/image-dialog"
import { Tables } from "@/database.types"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { MasterImageDialog } from "@/components/master-image-dialog"
import { MasterImageGalleryModal } from "@/components/master-image-gallery-modal"

interface Images extends Tables<'images'> {
    master_options: {
        id: string
        text: string
        master_questions: {
            id: string
            title: string
        }
    }
}

interface MasterOption extends Tables<'master_options'> {
    master_questions: Tables<'master_questions'>
}

interface OptionImages extends Tables<'option_images'> {
    images: Images
}

export default function AccountImagesPage() {
    const [images, setImages] = useState<Images[]>([])
    const [optionImages, setOptionImages] = useState<OptionImages[]>([])
    const [options, setOptions] = useState<MasterOption[]>([])
    const [accountData, setAccountData] = useState<Tables<'accounts'> | null>(null) // ここは適切な型に置き換えてください
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<MasterOption | null>(null)
    const [useMaster, setUseMaster] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    console.log(optionImages)

    const { id } = useParams()

    useEffect(() => {
        fetchAccountSettings()
        fetchImages()
    }, [id])

    const fetchAccountSettings = async () => {
        try {
            const { data: accountData, error: accountError } = await supabase.from("accounts").select("*").eq("id", id as string).single()


            if (accountError) {
                console.error("アカウント設定取得エラー:", accountError)
                return
            }

            if (accountData) {
                setAccountData(accountData)
            }
        } catch (error) {
            console.error("アカウント設定取得エラー:", error)
        }
    }

    const fetchImages = async () => {
        try {
            setLoading(true)
            setError(null)

            // 画像データを取得
            const { data, error } = await supabase.from("master_options").select(`*, master_questions (*)`).order("created_at", { ascending: true })
            const { data: imageData, error: imageError } = await supabase.from("option_images").select(`*, master_options(*, master_questions(*)), images (*)`).eq("account_id", id as string).order("created_at", { ascending: true })


            if (error || imageError) {
                console.error("画像取得エラー:", error)
                setError("画像の取得に失敗しました")
            } else {
                setOptions(data)
                setOptionImages(imageData)
            }
        } catch (error) {
            console.error("画像取得エラー:", error)
            setError("画像の取得に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (option: MasterOption | null = null) => {
        setSelectedOption(option)
        setDialogOpen(true)
    }

    const onSelect = async (imageId: string) => {
        // ダイアログ内で保存処理が行われるため、ここでは単に最新データを再取得
        if (!accountData || !selectedOption) {
            toast({ title: "アカウント情報が取得できません", variant: "destructive" })
            return
        }
        const { data, error } = await supabase.from("option_images")
            .insert([{
                account_id: accountData.id,
                image_id: imageId,
                master_option_id: selectedOption.id,
            }])
            .eq("account_id", accountData.id)
            .select()
        fetchImages()
        setDialogOpen(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <p>読み込み中...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <p>id: {id}</p>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">画像管理</h1>
                    <p className="text-muted-foreground">
                        {useMaster
                            ? "LINEボットで使用する画像を管理します。マスターオプションに画像を関連付けることができます。"
                            : "LINEボットで使用する画像を管理します。"}
                    </p>
                </div>
                {/* <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    新規画像
                </Button> */}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
                            {options && options.map((option) => (
                                <TableRow key={option.id}>
                                    <TableCell>
                                        {optionImages.find(oi => oi.master_option_id === option.id) && (
                                            <Link href={optionImages.find(oi => oi.master_option_id === option.id)?.images.url || "#"} target="_blank" rel="noopener noreferrer">
                                                <Image src={optionImages.find(oi => oi.master_option_id === option.id)?.images.url} alt='' width={150} height={150} />
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {option.master_questions.title} : 【{option.text}】
                                    </TableCell>
                                    <TableCell>{new Date(option.created_at).toLocaleDateString("ja-JP")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">メニューを開く</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(option)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    画像設定
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <MasterImageGalleryModal open={dialogOpen} onOpenChange={setDialogOpen} onSelect={onSelect} account={accountData!} />
        </div>
    )
}
