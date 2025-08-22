'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, MessageCircle, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import chatWithAgent from '@/app/service/interview/chatWithAgent'

export default function ChatComponent({ report, chat, setChat, user }) {
  const [userMessage, setUserMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const sendMessage = async () => {
    if (!userMessage.trim() || loading) return

    const updatedChat = [...chat, { role: 'user', content: userMessage }]
    setChat(updatedChat)
    setUserMessage('')
    setLoading(true)
    setError('')
 
    const response = await chatWithAgent(report, updatedChat)

    setLoading(false)

    if (!response.status) {
      setError(response.error || 'Something went wrong')
      return
    }

    const aiMessage = response.data
    setChat([...updatedChat, { role: 'assistant', content: aiMessage }])
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, loading])

  const hasMessages = Array.isArray(chat) && chat.length > 0

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Interview Copilot</h3>
            <p className="text-gray-600">AI-powered insights and guidance</p>
          </div>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* Chat Container */}
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl border border-gray-200 shadow-inner">
        {/* Chat Messages Area */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {!hasMessages && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-indigo-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Start a Conversation</h4>
              <p className="text-gray-600 max-w-md">
                Ask questions about your interview performance, get feedback insights, or discuss areas for improvement.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {hasMessages &&
              chat.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user?.firstName || 'User'} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Jina is analyzing your question...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white rounded-b-3xl">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none min-h-[48px] max-h-32 text-gray-800 placeholder-gray-500"
                placeholder="Ask about your interview performance... (Press Enter to send, Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                style={{
                  height: 'auto',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <div className="absolute right-3 top-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={loading || !userMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl min-h-[48px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </motion.button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
