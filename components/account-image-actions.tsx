"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pencil, MoreHorizontal } from "lucide-react"
import { MasterImageGalleryModal } from "@/components/master-image-gallery-modal"
import { useState } from "react"
import { Tables } from "@/database.types"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Props {
    option: Tables<"master_options">
    image?: Tables<"images"> | null
    optionImage?: Tables<"option_images"> | null
    account: Tables<"accounts">
}

export const AccountImageActions = ({ option, image, account, optionImage }: Props) => {
    const [open, setOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const onSelect = async (imageId: string) => {
        if (optionImage) {
            const { error } = await supabase
                .from("option_images")
                .update({
                    image_id: imageId,
                })
                .eq("id", optionImage.id)

            if (error) {
                console.error("画像の更新に失敗しました:", error)
            }
        } else {
            const { error } = await supabase
                .from("option_images")
                .insert({
                    account_id: account.id,
                    master_option_id: option.id,
                    image_id: imageId,
                })

            if (error) {
                console.error("画像の設定に失敗しました:", error)
            }
        }
        router.refresh()
    }


    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">メニューを開く</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        画像設定
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <MasterImageGalleryModal
                open={open}
                onOpenChange={setOpen}
                onSelect={onSelect}
                account={account}
            />
        </>
    )
}
