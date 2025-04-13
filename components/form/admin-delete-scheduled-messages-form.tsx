"use client";

import { deleteScheduledMessage } from "@/app/actions/admin/scheduled-messages";
import { Trash2 } from "lucide-react";
import React, { useActionState } from "react";
import { Button } from "../ui/button";

interface DeleteScheduledMessageFormProps {
    id: string;
}

export default function AdminDeleteScheduledMessageForm({id}: DeleteScheduledMessageFormProps) {
    const initialState = {
        id: id,
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
