'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getPokemonInfo } from '@/services/api';
import { LogOut, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export default function Chat() {
    const [input, setInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    useEffect(() => {
        // 初期メッセージを表示
        setMessages([
            {
                id: '1',
                text: 'こんにちは！ポケモンの名前を入力すると、そのポケモンの情報をお教えします。',
                isUser: false,
                timestamp: new Date(),
            },
        ]);
    }, []);

    useEffect(() => {
        // 新しいメッセージが追加されたら自動スクロール
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: input,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await getPokemonInfo(input, conversationId);

            if (response) {
                setConversationId(response.conversation_id);

                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.answer,
                    isUser: false,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error fetching response:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'すみません、エラーが発生しました。もう一度試してください。',
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (!user) {
        return null; // ログインしていない場合は何も表示しない
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* ヘッダー */}
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 className="text-2xl font-bold">PokeChat</h1>
                <div className="flex items-center space-x-4">
                    <span>{user.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-1 p-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>ログアウト</span>
                    </button>
                </div>
            </header>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg ${message.isUser
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            <p
                                className={`text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 p-3 rounded-lg rounded-bl-none shadow-md">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="ポケモンの名前を入力してください..."
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
} 