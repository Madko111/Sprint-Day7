import OpenAI from 'openai'
import { streamText } from 'ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
})

export const runtime = 'edge'

// Mock streaming function for testing without OpenAI API key
function createMockStream(userMessage: string) {
  const mockResponses = [
    `Привет! Я mock-AI для тестирования. Ты написал: "${userMessage}". Streaming работает отлично! 🚀`,
    `Я вижу твоё сообщение: "${userMessage}". Это mock-версия, чтобы протестировать UI без OpenAI ключа. Всё работает!`,
    `Mock AI получил: "${userMessage}". Реальный OpenAI будет работать точно так же, только с умными ответами вместо этого. 😄`,
    `Тестовый ответ на: "${userMessage}". Streaming идёт слово за словом, как в настоящем ChatGPT!`,
    `Отлично! Ты спросил: "${userMessage}". Mock AI подтверждает: вся система работает корректно. Можно переключаться на OpenAI.`,
  ]
  
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
  const words = response.split(' ')
  
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(new TextEncoder().encode(word + ' '))
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      }
      controller.close()
    },
  })
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json()

    // Mock mode for testing without OpenAI API key
    if (process.env.USE_MOCK_AI === 'true') {
      const lastUserMessage = messages[messages.length - 1]?.content || 'Привет'
      return createMockStream(lastUserMessage)
    }

    // Real OpenAI streaming
    // Sliding window: keep only last 10 messages to reduce token usage
    const recentMessages = messages.slice(-10)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        ...recentMessages,
      ],
    })

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(new TextEncoder().encode(text))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Error processing chat', { status: 500 })
  }
}
