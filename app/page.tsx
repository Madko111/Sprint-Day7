'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Conversation, Message } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Plus, Settings, LogOut, Send, Square } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
    checkUser()
  }, [])

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id)
    }
  }, [currentConversation])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    }
  }

  async function loadConversations() {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (data && !error) {
      setConversations(data)
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0])
      }
    }
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data && !error) {
      setMessages(data)
    }
  }

  async function createNewConversation() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title: 'New Chat',
      })
      .select()
      .single()

    if (data && !error) {
      setConversations([data, ...conversations])
      setCurrentConversation(data)
      setMessages([])
      setSidebarOpen(false)
    }
  }

  async function deleteConversation(id: string) {
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)

    const updated = conversations.filter(c => c.id !== id)
    setConversations(updated)
    
    if (currentConversation?.id === id) {
      setCurrentConversation(updated[0] || null)
      setMessages([])
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function sendMessage() {
    if (!input.trim() || !currentConversation || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setStreamingMessage('')

    // Save user message
    const { data: savedMessage } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: currentConversation.id,
        role: 'user',
        content: userMessage,
        tokens: Math.ceil(userMessage.length / 4),
      })
      .select()
      .single()

    if (savedMessage) {
      setMessages(prev => [...prev, savedMessage])
    }

    // Generate title if first message
    if (messages.length === 0) {
      generateTitle(userMessage)
    }

    // Stream AI response
    const controller = new AbortController()
    setAbortController(controller)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          conversationId: currentConversation.id,
          systemPrompt: currentConversation.system_prompt,
        }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk
        setStreamingMessage(fullResponse)
      }

      // Save assistant message
      const { data: assistantMessage } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: fullResponse,
          tokens: Math.ceil(fullResponse.length / 4),
        })
        .select()
        .single()

      if (assistantMessage) {
        setMessages(prev => [...prev, assistantMessage])
      }

      setStreamingMessage('')
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error)
      }
    } finally {
      setLoading(false)
      setAbortController(null)
    }
  }

  async function generateTitle(firstMessage: string) {
    if (!currentConversation) return

    try {
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: firstMessage }),
      })

      const { title } = await response.json()

      await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', currentConversation.id)

      setCurrentConversation({ ...currentConversation, title })
      setConversations(prev =>
        prev.map(c => c.id === currentConversation.id ? { ...c, title } : c)
      )
    } catch (error) {
      console.error('Title generation failed:', error)
    }
  }

  function stopGeneration() {
    if (abortController) {
      abortController.abort()
      setLoading(false)
      setStreamingMessage('')
    }
  }

  const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)

  const sidebar = (
    <div className="flex h-full flex-col bg-muted/40">
      <div className="border-b p-4">
        <Button onClick={createNewConversation} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setCurrentConversation(conv)
                setSidebarOpen(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                currentConversation?.id === conv.id ? 'bg-accent' : ''
              }`}
            >
              <div className="truncate font-medium">{conv.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {new Date(conv.updated_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 border-r md:block">
        {sidebar}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center border-b px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 flex-1 truncate text-lg font-semibold md:ml-0">
            {currentConversation?.title || 'Select a conversation'}
          </h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading || !currentConversation}
                className="flex-1"
              />
              {loading ? (
                <Button type="button" onClick={stopGeneration} size="icon">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim() || !currentConversation}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              Total tokens: {totalTokens}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
