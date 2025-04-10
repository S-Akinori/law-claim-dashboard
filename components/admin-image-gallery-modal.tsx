"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface ImageFile {
  id: string
  url: string
  name: string
  account_id: string
  created_at: string
}

interface Account {
  id: string
  name: string
}

interface ImageGalleryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
}

export function AdminImageGalleryModal({ open, onOpenChange, onSelect }: ImageGalleryModalProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchAccounts()
      fetchImages()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [selectedAccount, open])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase.from("accounts").select("id, name")

      if (error) {
        console.error("アカウント取得エラー:", error)
        return
      }

      setAccounts(data || [])
    } catch (err) {
      console.error("アカウント取得エラー:", err)
    }
  }

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from("images").select("*")

      if (selectedAccount !== "all") {
        query = query.eq("account_id", selectedAccount)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("画像データ取得エラー:", error)
        setError("画像データの取得に失敗しました")
        return
      }

      setImages(data || [])
    } catch (err) {
      console.error("画像一覧取得エラー:", err)
      setError("画像一覧の取得中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // 検索クエリに基づいて画像をフィルタリング
  const filteredImages = images.filter((image) => image.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId)
    return account ? account.name : "不明なアカウント"
  }

  const handleSelect = () => {
    const selectedImage = images.find((img) => img.id === selectedImageId)
    if (selectedImage) {
      onSelect(selectedImage.url)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>ギャラリーから画像を選択</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="画像を検索..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="アカウントを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのアカウント</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-destructive p-4">{error}</div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? "検索条件に一致する画像がありません" : "アップロードされた画像がありません"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`
                    relative aspect-square rounded-md overflow-hidden cursor-pointer border-2
                    ${selectedImageId === image.id ? "border-primary" : "border-transparent"}
                    hover:border-primary/50 transition-all
                  `}
                  onClick={() => setSelectedImageId(image.id)}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=160&width=160"
                      e.currentTarget.alt = "イメージを読み込めませんでした"
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                    {image.name}
                  </div>
                  <div className="absolute top-0 right-0 bg-black/60 text-white p-1 text-xs">
                    {getAccountName(image.account_id)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSelect} disabled={!selectedImageId}>
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

