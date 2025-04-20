'use client'
import { copyMasterData } from "@/app/actions/admin/copy-master-data";
import { useActionState } from "react";
import { Button } from "../ui/button";

interface AdminCopyMasterDataFormProps {
    accountId: string;
}

const AdminCopyMasterDataForm = ({accountId}: AdminCopyMasterDataFormProps) => {
    const initialState = {
        accountId: accountId,
        message: "",
    };

    const [state, formAction, pending] = useActionState(copyMasterData, initialState);
    
    return (
        <form action={formAction} className="space-y-4">
            {state.message && <p className="text-red-500">{state.message}</p>}
            <Button type="submit" disabled={pending}>
                {pending ? "コピー中..." : "マスターデータをコピーする"}
            </Button>
        </form>
    );
}

export default AdminCopyMasterDataForm;