Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, currentFormula, derivationHistory, apiKey, model } = await req.json();

    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Build context from derivation history
    let systemPrompt = `你是一个专业的数学推导助手。你的任务是帮助用户理解和完成数学推导过程。

当前公式: ${currentFormula || '无'}

推导历史:
${derivationHistory?.map((step: { operation: string; latex: string }, i: number) => 
  `步骤${i + 1}: ${step.operation} -> ${step.latex}`
).join('\n') || '无历史记录'}

请基于上下文提供精确的数学指导。使用LaTeX格式表示公式（用$...$包裹行内公式，$$...$$包裹独立公式）。`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Default to using a compatible API (OpenAI-compatible format)
    const apiUrl = model?.includes('claude') 
      ? 'https://api.anthropic.com/v1/messages'
      : 'https://api.openai.com/v1/chat/completions';

    let response;
    
    if (model?.includes('claude')) {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages
        })
      });
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: apiMessages,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${errorText}`);
    }

    const result = await response.json();
    
    let content = '';
    if (model?.includes('claude')) {
      content = result.content?.[0]?.text || '';
    } else {
      content = result.choices?.[0]?.message?.content || '';
    }

    return new Response(JSON.stringify({ data: { content } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: { code: 'AI_CHAT_ERROR', message: error.message } 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
