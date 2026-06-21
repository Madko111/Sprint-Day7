export interface Conversation {
  id: string
  user_id: string
  title: string
  system_prompt: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens: number
  created_at: string
}

export interface CreateConversationData {
  title?: string
  system_prompt?: string
}

export interface CreateMessageData {
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
}
