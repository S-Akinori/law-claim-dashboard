"use client";

import { deleteScheduledMessage } from "@/app/actions/scheduled-messages";
import { Trash2 } from "lucide-react";
import React, { useActionState } from "react";
import { Button } from "../ui/button";

interface DeleteScheduledMessageFormProps {
    id: string;
    accountId: string;
}

export default function DeleteScheduledMessageForm({id, accountId}: DeleteScheduledMessageFormProps) {
    const initialState = {
        id: id,
        account_id: accountId,
        message: '',
    }
    console.log(initialState)
    const [state, formAction, pending] = useActionState(deleteScheduledMessage, initialState)

    return (
        <form action={formAction} className="flex items-center">
            <Button variant="destructive" type="submit" disabled={pending}>
                <Trash2 className="h-4 w-4" />削除
            </Button>
        </form>
    )
}
