"use client";

import { deleteStartTrigger } from "@/app/actions/start-triggers";
import { Trash2 } from "lucide-react";
import React, { useActionState } from "react";
import { Button } from "../ui/button";

interface DeleteStartTriggerFormProps {
    triggerId: string;
}

export default function DeleteStartTriggerForm({triggerId}: DeleteStartTriggerFormProps) {
    const initialState = {
        id: triggerId,
        message: '',
    }
    const [state, formAction, pending] = useActionState(deleteStartTrigger, initialState)

    return (
        <form action={formAction} className="flex items-center">
            <Button variant="destructive" type="submit" disabled={pending}>
                <Trash2 className="h-4 w-4" />削除
            </Button>
        </form>
    )
}
