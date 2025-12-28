'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { useAuth } from '@/contexts'
import { api, Thread } from '@/lib/api'

// Map Thread to a simpler format for UI
interface MessageThread {
  id: string
  other_participant_name?: string
  unread_count: number
  last_message?: {
    content: string
    created_at: string
  }
  related_post_title?: string
}

function mapThreadToMessageThread(thread: Thread): MessageThread {
  return {
    id: thread.id,
    other_participant_name: thread.subject || 'Neighbor',
    unread_count: thread.unread_count,
    last_message: thread.last_message ? {
      content: thread.last_message,
      created_at: thread.last_message_at || new Date().toISOString(),
    } : undefined,
    related_post_title: thread.subject,
  }
}

export default function MessagesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)

  useEffect(() => {
    async function fetchThreads() {
      if (!isAuthenticated) return

      try {
        const data = await api.messages.listThreads()
        setThreads(data.map(mapThreadToMessageThread))
      } catch (error) {
        console.error('Failed to fetch threads:', error)
        setThreads([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchThreads()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (authLoading) {
    return (
      <AppShell title="Messages">
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
        </div>
      </AppShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppShell title="Messages">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">chat_bubble</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Connect with your community
          </h2>
          <p className="text-stone-500 dark:text-stone-500 mb-6 max-w-sm">
            Sign in to message neighbors and coordinate participation in the community.
          </p>
          <Link
            href="/login?redirect=/messages"
            className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            Sign In to Message
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Messages">
      <div className="flex flex-col lg:flex-row min-h-full">
        {/* Thread List */}
        <div className={`lg:w-80 lg:border-r border-stone-200 dark:border-stone-800 ${selectedThread ? 'hidden lg:block' : ''}`}>
          <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
            <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Messages
            </h1>
          </div>

          {isLoading ? (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-3">
                  <div className="size-12 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-24" />
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-stone-400 text-[32px]">forum</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                No conversations yet
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                When you respond to an invitation or someone reaches out, your conversations will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {threads.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThread?.id === thread.id}
                  onClick={() => setSelectedThread(thread)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Message View */}
        <div className={`flex-1 ${!selectedThread ? 'hidden lg:flex' : 'flex'} flex-col`}>
          {selectedThread ? (
            <ThreadView
              thread={selectedThread}
              onBack={() => setSelectedThread(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-stone-300 dark:text-stone-700 text-[64px]">
                  select_all
                </span>
                <p className="text-stone-500 dark:text-stone-500 mt-4">
                  Select a conversation to view messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

interface ThreadListItemProps {
  thread: MessageThread
  isSelected: boolean
  onClick: () => void
}

function ThreadListItem({ thread, isSelected, onClick }: ThreadListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-4 flex gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors ${
        isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''
      }`}
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-[20px]">person</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">
            {thread.other_participant_name || 'Neighbor'}
          </p>
          {thread.unread_count > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold shrink-0">
              {thread.unread_count}
            </span>
          )}
        </div>
        {thread.last_message && (
          <p className="text-sm text-stone-500 dark:text-stone-500 truncate mt-0.5">
            {thread.last_message.content}
          </p>
        )}
        {thread.related_post_title && (
          <p className="text-xs text-primary truncate mt-1">
            Re: {thread.related_post_title}
          </p>
        )}
      </div>
    </button>
  )
}

interface ThreadViewProps {
  thread: MessageThread
  onBack: () => void
}

function ThreadView({ thread, onBack }: ThreadViewProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    async function fetchMessages() {
      try {
        const data = await api.messages.getMessages(thread.id)
        setMessages(data)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [thread.id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const message = await api.messages.sendMessage(thread.id, newMessage.trim())
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
        <button
          onClick={onBack}
          className="lg:hidden size-10 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">
            {thread.other_participant_name || 'Neighbor'}
          </p>
          {thread.related_post_title && (
            <p className="text-xs text-stone-500 dark:text-stone-500 truncate">
              Re: {thread.related_post_title}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-500 dark:text-stone-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  message.is_from_me
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.is_from_me ? 'text-white/70' : 'text-stone-500'}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-3 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSending ? 'progress_activity' : 'send'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
