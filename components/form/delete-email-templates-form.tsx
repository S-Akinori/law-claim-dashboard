"use client";


import { Trash2 } from "lucide-react";
import React, { useActionState } from "react";
import { Button } from "../ui/button";
import { deleteEmailTemplates } from "@/app/actions/email-templates";

interface DeleteEmailTemplateFormProps {
    templateId: string;
}

export default function DeleteEmailTemplateForm({templateId}: DeleteEmailTemplateFormProps) {
    const initialState = {
        id: templateId,
        message: '',
    }
    const [state, formAction, pending] = useActionState(deleteEmailTemplates, initialState)

    return (
        <form action={formAction} className="flex items-center">
            <Button variant="destructive" type="submit" disabled={pending}>
                <Trash2 className="h-4 w-4" />削除
            </Button>
        </form>
    )
}
