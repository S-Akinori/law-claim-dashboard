'use client'
import { useActionState } from "react";
import { Button } from "../ui/button";
import { changeMasterMode } from "@/app/actions/admin/change-master-mode";

interface AdminChangeMasterModeFormProps {
    accountId: string;
}

const AdminChangeMasterModeForm = ({accountId}: AdminChangeMasterModeFormProps) => {
    const initialState = {
        accountId: accountId,
        message: "",
    };

    const [state, formAction, pending] = useActionState(changeMasterMode, initialState);
    
    return (
        <form action={formAction} className="space-y-4">
            {state.message && <p className="text-red-500">{state.message}</p>}
            <Button type="submit" disabled={pending}>
                {pending ? "保存中..." : "マスターデータを使用する"}
            </Button>
        </form>
    );
}

export default AdminChangeMasterModeForm;