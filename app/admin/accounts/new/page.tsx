import AdminAccountForm from "@/components/form/admin-account-form";

export default function CreateUserPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">新規ユーザー登録</h1>
      <AdminAccountForm />
    </div>
  )
}
