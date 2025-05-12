async function getMasterQuestionFlow(startId: string, condition: string) {
    
    const visited: string[] = []
    const questions: any[] = []
  
    let currentId = startId
  
    while (currentId) {
      if (visited.includes(currentId)) break
      visited.push(currentId)
  
      const { data: question } = await supabase
        .from("master_questions")
        .select("*")
        .eq("id", currentId)
        .single()
  
      if (!question) break
      questions.push(question)
  
      const { data: route } = await supabase
        .from("master_question_routes")
        .select("next_master_question_id")
        .eq("from_master_question_id", currentId)
        .eq("condition_group", condition)
        .maybeSingle()
  
      currentId = route?.next_master_question_id || null
    }
  
    return questions
  }
  