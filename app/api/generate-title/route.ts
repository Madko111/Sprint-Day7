import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
})

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // Mock mode for testing without OpenAI API key
    if (process.env.USE_MOCK_AI === 'true') {
      const words = message.split(' ').slice(0, 5).join(' ')
      const title = words.length > 25 ? words.substring(0, 25) + '...' : words
      return Response.json({ title: title || 'Test Chat' })
    }

    // Real OpenAI title generation
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate a short, descriptive title (max 5 words) for this conversation based on the first user message. Return only the title, nothing else.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 20,
    })

    const title = response.choices[0]?.message?.content?.trim() || 'New Chat'

    return Response.json({ title })
  } catch (error) {
    console.error('Title generation error:', error)
    return Response.json({ title: 'New Chat' })
  }
}
