"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ImageGalleryModal } from "@/components/image-gallery-modal"

// Optionインターフェースに画像URLを追加
interface Option {
    id?: string
    text: string
    image_url?: string
    isNew?: boolean
    isDeleted?: boolean
}

interface Question {
    id: string
    title: string
    text: string
    type: string
    account_id: string
    options: Option[]
}

export default function EditQuestionPage() {
    const [question, setQuestion] = useState<Question | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()
    const accountId = params.id as string
    const questionId = params.questionId as string
    const supabase = createClient()

    // 画像ギャラリーモーダルの状態
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [currentOptionIndex, setCurrentOptionIndex] = useState<number | null>(null)

    useEffect(() => {
        fetchQuestion()
    }, [questionId])

    const fetchQuestion = async () => {
        try {
            setLoading(true)
            setError(null)

            // 質問データを取得
            const { data: questionData, error: questionError } = await supabase
                .from("questions")
                .select("*")
                .eq("id", questionId)
                .single()

            if (questionError) {
                console.error("質問データ取得エラー:", questionError)
                setError("質問データの取得に失敗しました")
                return
            }

            // 選択肢データを取得
            const { data: optionsData, error: optionsError } = await supabase
                .from("options")
                .select("*")
                .eq("question_id", questionId)

            if (optionsError) {
                console.error("選択肢データ取得エラー:", optionsError)
                setError("選択肢データの取得に失敗しました")
                return
            }

            setQuestion({
                ...questionData,
                options: optionsData || [],
            })
        } catch (err) {
            console.error("データ取得エラー:", err)
            setError("データの取得中にエラーが発生しました")
        } finally {
            setLoading(false)
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (question) {
            setQuestion({ ...question, title: e.target.value })
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (question) {
            setQuestion({ ...question, text: e.target.value })
        }
    }

    const handleTypeChange = (value: string) => {
        if (question) {
            setQuestion({ ...question, type: value })
        }
    }

    const handleAddOption = () => {
        if (question) {
            setQuestion({
                ...question,
                options: [...question.options, { text: "", isNew: true }],
            })
        }
    }

    // handleOptionChangeメソッドを更新して画像URLも扱えるようにする
    const handleOptionChange = (index: number, field: "text" | "image_url", value: string) => {
        if (question) {
            const newOptions = [...question.options]
            newOptions[index][field] = value
            setQuestion({ ...question, options: newOptions })
        }
    }

    const handleRemoveOption = (index: number) => {
        if (question) {
            const newOptions = [...question.options]

            // 既存の選択肢の場合は削除フラグを立てる
            if (newOptions[index].id) {
                newOptions[index].isDeleted = true
            } else {
                // 新規追加した選択肢の場合は配列から削除
                newOptions.splice(index, 1)
            }

            setQuestion({ ...question, options: newOptions })
        }
    }

    // 画像アップロード処理を追加
    const handleImageUpload = async (index: number, file: File) => {
        if (!question) return

        try {
            setError(null)

            const { data: accountData, error: accountError } = await supabase
                .from("accounts")
                .select("*")
                .eq("id", accountId)
                .single()

            if (accountError) {
                console.error("アカウントデータ取得エラー:", accountError)
                return
            }
            if (!accountData) {
                console.error("アカウントデータが見つかりません")
                return
            }


            const userId = accountData.user_id

            // ファイル名を一意にするために現在時刻とランダム文字列を追加
            const fileExt = file.name.split(".").pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
            const filePath = `${userId}/${accountId}/${fileName}`

            // Supabaseストレージにアップロード
            const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

            if (uploadError) {
                console.error("画像アップロードエラー:", uploadError)
                return
            }

            // 公開URLを取得
            const { data: publicURL } = supabase.storage.from("images").getPublicUrl(filePath)

            // imagesテーブルにデータを挿入
            const { data: imageData, error: insertError } = await supabase
                .from("images")
                .insert([
                    {
                        account_id: accountId,
                        url: publicURL.publicUrl,
                        description: file.name, // 初期説明としてファイル名を使用
                    },
                ])
                .select()
                .single()

            if (insertError) {
                console.error("画像データ挿入エラー:", insertError)

            }

            // 選択肢の画像URLを更新
            const newOptions = [...question.options]
            newOptions[index].image_url = publicURL.publicUrl
            setQuestion({ ...question, options: newOptions })

        } catch (err) {
            console.error("画像アップロードエラー:", err)

        }
    }

    // ギャラリーから画像を選択する処理
    const handleOpenGallery = (index: number) => {
        setCurrentOptionIndex(index)
        setGalleryOpen(true)
    }

    // ギャラリーで選択した画像を設定する処理
    const handleSelectImage = (imageUrl: string) => {
        if (currentOptionIndex !== null && question) {
            const newOptions = [...question.options]
            newOptions[currentOptionIndex].image_url = imageUrl
            setQuestion({ ...question, options: newOptions })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!question) return

        try {
            setSaving(true)
            setError(null)

            // 質問データを更新
            const { error: updateQuestionError } = await supabase
                .from("questions")
                .update({
                    title: question.title,
                    text: question.text,
                    type: question.type,
                })
                .eq("id", question.id)

            if (updateQuestionError) {
                console.error("質問更新エラー:", updateQuestionError)
                setError("質問の更新に失敗しました")
                return
            }

            // 削除する選択肢を処理
            const optionsToDelete = question.options.filter((option) => option.id && option.isDeleted)

            for (const option of optionsToDelete) {
                const { error: deleteOptionError } = await supabase.from("options").delete().eq("id", option.id)

                if (deleteOptionError) {
                    console.error("選択肢削除エラー:", deleteOptionError)
                    setError("選択肢の削除に失敗しました")
                    return
                }
            }

            // 新規追加する選択肢を処理
            const optionsToAdd = question.options.filter((option) => option.isNew && !option.isDeleted)

            if (optionsToAdd.length > 0) {
                const optionsToInsert = optionsToAdd.map((option) => ({
                    question_id: question.id,
                    text: option.text,
                    image_url: option.image_url || null,
                }))

                const { error: addOptionsError } = await supabase.from("options").insert(optionsToInsert)

                if (addOptionsError) {
                    console.error("選択肢追加エラー:", addOptionsError)
                    setError("選択肢の追加に失敗しました")
                    return
                }
            }

            // 既存の選択肢を更新
            const optionsToUpdate = question.options.filter((option) => option.id && !option.isNew && !option.isDeleted)

            for (const option of optionsToUpdate) {
                const { error: updateOptionError } = await supabase
                    .from("options")
                    .update({
                        text: option.text,
                        image_url: option.image_url,
                    })
                    .eq("id", option.id)

                if (updateOptionError) {
                    console.error("選択肢更新エラー:", updateOptionError)
                    setError("選択肢の更新に失敗しました")
                    return
                }
            }


            router.push(`/admin/accounts/${params.id}/questions`)
        } catch (err) {
            console.error("更新エラー:", err)
            setError("更新中にエラーが発生しました")
        } finally {
            setSaving(false)
        }
    }
    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" asChild className="mr-2">
                        <Link href={`/admin/accounts/${params.id}/questions`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            戻る
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">質問編集</h1>
                </div>
                {question && (

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>質問情報</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="questionTitle">質問タイトル</Label>
                                    <Input
                                        id="questionTitle"
                                        placeholder="質問のタイトルを入力してください"
                                        value={question.title}
                                        onChange={handleTitleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="questionText">質問内容</Label>
                                    <Textarea
                                        id="questionText"
                                        placeholder="質問内容を入力してください"
                                        value={question.text}
                                        onChange={handleTextChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="questionType">質問タイプ</Label>
                                    <Select value={question.type} onValueChange={handleTypeChange} required>
                                        <SelectTrigger id="questionType">
                                            <SelectValue placeholder="質問タイプを選択" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">テキスト入力</SelectItem>
                                            <SelectItem value="button">ボタン選択</SelectItem>
                                            <SelectItem value="image_carousel">画像カルーセル</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(question.type === "button" || question.type === "image_carousel") && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>選択肢</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                選択肢を追加
                                            </Button>
                                        </div>

                                        {question.options.filter((option) => !option.isDeleted).length === 0 ? (
                                            <div className="text-center py-4 text-muted-foreground">
                                                選択肢がありません。「選択肢を追加」ボタンをクリックして追加してください。
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {question.options.map(
                                                    (option, index) =>
                                                        !option.isDeleted && (
                                                            <div key={option.id || `new-${index}`} className="space-y-3 border p-4 rounded-md">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1">
                                                                        <Label htmlFor={`option-text-${index}`} className="mb-2 block">
                                                                            選択肢テキスト
                                                                        </Label>
                                                                        <Input
                                                                            id={`option-text-${index}`}
                                                                            placeholder={`選択肢 ${index + 1}`}
                                                                            value={option.text}
                                                                            onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleRemoveOption(index)}
                                                                        className="self-start mt-8"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>

                                                                {question.type === "image_carousel" && (
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`option-image-${index}`} className="block">
                                                                            画像URL
                                                                        </Label>
                                                                        <div className="flex gap-2">
                                                                            <Input
                                                                                id={`option-image-${index}`}
                                                                                placeholder="画像URLを入力または画像をアップロード"
                                                                                value={option.image_url || ""}
                                                                                onChange={(e) => handleOptionChange(index, "image_url", e.target.value)}
                                                                                className="flex-1"
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <div className="relative">
                                                                                    <Input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files && e.target.files[0]) {
                                                                                                handleImageUpload(index, e.target.files[0])
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <Button type="button" variant="outline">
                                                                                        <Upload className="h-4 w-4 mr-2" />
                                                                                        アップロード
                                                                                    </Button>
                                                                                </div>
                                                                                <Button type="button" variant="outline" onClick={() => handleOpenGallery(index)}>
                                                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                                                    ギャラリー
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        {option.image_url && (
                                                                            <div className="mt-2">
                                                                                <p className="text-sm text-muted-foreground mb-1">プレビュー:</p>
                                                                                <div className="relative w-full h-40 border rounded-md overflow-hidden">
                                                                                    <img
                                                                                        src={option.image_url || "/placeholder.svg"}
                                                                                        alt={option.text}
                                                                                        className="object-cover w-full h-full"
                                                                                        onError={(e) => {
                                                                                            e.currentTarget.src = "/placeholder.svg?height=160&width=320"
                                                                                            e.currentTarget.alt = "イメージを読み込めませんでした"
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" asChild>
                                    <Link href={`/admin/accounts/${params.id}/questions`}>キャンセル</Link>
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? "保存中..." : "保存"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                )}
            </div>

            {/* 画像ギャラリーモーダル */}
            <ImageGalleryModal open={galleryOpen} onOpenChange={setGalleryOpen} onSelect={handleSelectImage} />
        </>
    )
}

