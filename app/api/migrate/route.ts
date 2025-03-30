import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: { path: string; domain?: string }) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // RLSを一時的に無効化
    await supabase.rpc("disable_rls")

    // 1. companiesテーブルをaccountsに変更
    const { error: renameTableError } = await supabase.rpc("execute_sql", {
      sql: `
        -- テーブルが存在するか確認
        DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') THEN
            -- テーブル名変更
            ALTER TABLE companies RENAME TO accounts;
            
            -- 外部キー制約の列名も更新
            ALTER TABLE questions RENAME COLUMN company_id TO account_id;
          END IF;
        END
        $$;
      `,
    })

    if (renameTableError) {
      console.error("テーブル名変更エラー:", renameTableError)
      return NextResponse.json({ error: "テーブル名変更に失敗しました" }, { status: 500 })
    }

    // 2. accountsテーブルにuser_idカラムを追加
    const { error: addColumnError } = await supabase.rpc("execute_sql", {
      sql: `
        -- カラムが存在しない場合のみ追加
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name = 'user_id'
          ) THEN
            ALTER TABLE accounts ADD COLUMN user_id UUID REFERENCES auth.users(id);
          END IF;
        END
        $$;
      `,
    })

    if (addColumnError) {
      console.error("カラム追加エラー:", addColumnError)
      return NextResponse.json({ error: "カラム追加に失敗しました" }, { status: 500 })
    }

    // 3. usersテーブルをline_usersに変更
    const { error: renameUsersTableError } = await supabase.rpc("execute_sql", {
      sql: `
        -- テーブルが存在するか確認
        DO $$
        BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
            -- テーブル名変更
            ALTER TABLE users RENAME TO line_users;
            
            -- 外部キー制約の参照先も更新
            ALTER TABLE user_responses 
            DROP CONSTRAINT IF EXISTS user_responses_user_id_fkey,
            ADD CONSTRAINT user_responses_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES line_users(id);
          END IF;
        END
        $$;
      `,
    })

    if (renameUsersTableError) {
      console.error("ユーザーテーブル名変更エラー:", renameUsersTableError)
      return NextResponse.json({ error: "ユーザーテーブル名変更に失敗しました" }, { status: 500 })
    }

    // RLSを再度有効化
    await supabase.rpc("enable_rls")

    return NextResponse.json({ success: true, message: "マイグレーションが完了しました" })
  } catch (error) {
    console.error("マイグレーションエラー:", error)
    return NextResponse.json({ error: "マイグレーション中にエラーが発生しました" }, { status: 500 })
  }
}

