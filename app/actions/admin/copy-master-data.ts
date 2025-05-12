'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function copyMasterData(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const questionIdMap: Record<string, string> = {}
    const optionIdMap: Record<string, string> = {}
    const conditionGroupMap: Record<string, string> = {}

    const accountId = prevState.accountId

    const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('account_id', accountId)

    // すでに質問が登録されている場合は、何もしない
    if (questionsData && questionsData.length > 0) {
        const { error } = await supabase.from('accounts').update({
            use_master: false,
        }).eq('id', accountId).select('*')
        if (error) return { message: `accounts update error: ${error.message}` }
        else redirect('/admin')
    }

    // 1. master_questions -> questions
    const { data: masterQuestions } = await supabase.from('master_questions').select('*')
    const insertedQuestions = await supabase.from('questions').insert(
        masterQuestions?.map(q => ({
            account_id: accountId,
            text: q.text,
            type: q.type,
            title: q.title,
            key: q.key,
        })) || []
    ).select('id')

    if (insertedQuestions.error) return { message: `questions insert error: ${insertedQuestions.error.message}` }
    masterQuestions?.forEach((q, idx) => {
        questionIdMap[q.id] = insertedQuestions.data?.[idx]?.id
    })

    const {data: optionImages} = await supabase
        .from('option_images')
        .select('*, images(*)')
        .eq('account_id', accountId)

    // 2. master_options -> options
    const { data: masterOptions } = await supabase.from('master_options').select('*')
    const insertedOptions = await supabase.from('options').insert(
        masterOptions?.map(o => ({
            question_id: questionIdMap[o.master_question_id],
            text: o.text,
            image_url: optionImages?.find((img) => img.master_option_id === o.id)?.images?.url || null,
        })) || []
    ).select('id')

    if (insertedOptions.error) return { message: `options insert error: ${insertedOptions.error.message}` }
    masterOptions?.forEach((o, idx) => {
        optionIdMap[o.id] = insertedOptions.data?.[idx]?.id
    })

    // 3. master_question_routes -> question_routes
    const { data: masterRoutes } = await supabase.from('master_question_routes').select('*')
    const insertedRoutes = await supabase.from('question_routes').insert(
        masterRoutes?.map(r => ({
            account_id: accountId,
            from_question_id: questionIdMap[r.from_master_question_id],
            next_question_id: questionIdMap[r.next_master_question_id],
            condition_group: r.condition_group,
        })) || []
    ).select('id')

    if (insertedRoutes.error) return { message: `routes insert error: ${insertedRoutes.error.message}` }
    masterRoutes?.forEach((r, idx) => {
        conditionGroupMap[r.condition_group] = r.condition_group // 同一グループ名維持
    })

    // 4. master_conditions -> conditions
    const { data: masterConditions } = await supabase.from('master_conditions').select('*')
    const conditionInserts = masterConditions?.map(c => ({
        account_id: accountId,
        question_id: questionIdMap[c.master_question_id],
        required_question_id: questionIdMap[c.required_master_question_id],
        required_option_id: c.required_master_option_id ? optionIdMap[c.required_master_option_id] : null,
        operator: c.operator,
        value: c.value,
        condition_group: c.condition_group,
    })) || []
    const insertedConditions = await supabase.from('conditions').insert(conditionInserts)
    if (insertedConditions.error) return { message: `conditions insert error: ${insertedConditions.error.message}` }

    // 5. master_start_triggers -> start_triggers
    const { data: masterTriggers } = await supabase.from('master_start_triggers').select('*')
    const triggerInserts = masterTriggers?.map(t => ({
        account_id: accountId,
        keyword: t.keyword,
        question_id: questionIdMap[t.master_question_id],
    })) || []
    const insertedTriggers = await supabase.from('start_triggers').insert(triggerInserts)
    if (insertedTriggers.error) return { message: `start_triggers insert error: ${insertedTriggers.error.message}` }

    // 6. master_email_templates -> email_templates
    const { data: masterEmails } = await supabase.from('master_email_templates').select('*')
    const emailInserts = masterEmails?.map(e => ({
        account_id: accountId,
        subject: e.subject,
        body: e.body,
    })) || []
    const insertedEmails = await supabase.from('email_templates').insert(emailInserts)
    if (insertedEmails.error) return { message: `email_templates insert error: ${insertedEmails.error.message}` }

    // 7. master_scheduled_messages -> scheduled_messages
    const { data: masterSchedules } = await supabase.from('master_scheduled_messages').select('*')
    const scheduleInserts = masterSchedules?.map(s => ({
        account_id: accountId,
        day_offset: s.day_offset,
        hour: s.hour,
        message: s.message,
    })) || []
    const insertedSchedules = await supabase.from('scheduled_messages').insert(scheduleInserts)
    if (insertedSchedules.error) return { message: `scheduled_messages insert error: ${insertedSchedules.error.message}` }

    const { error } = await supabase.from('accounts').update({
        use_master: false,
    }).eq('id', accountId).select('*')

    if (error) return { message: `accounts update error: ${error.message}` }
    else redirect(`/admin/accounts/${accountId}`)
    // // 8. master_actions -> actions
    // const { data: masterActions } = await supabase.from('master_actions').select('*')
    // const actionInserts = masterActions?.map(a => ({
    //     account_id: accountId,
    //     type: a.type,
    //     next_question_id: questionIdMap[a.next_master_question_id],
    //     email_template_id: a.master_email_template_id ? insertedEmails.data?.find(e => e.subject === a.master_email_template_id)?.id : null,
    // })) || []
    // const insertedActions = await supabase.from('actions').insert(actionInserts)
    // if (insertedActions.error) return { message: `actions insert error: ${insertedActions.error.message}` }
    
}
