import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Tile, TextInput, Button } from '@carbon/react';
import { ChatLaunch, Close } from '@carbon/icons-react';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'
const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const params = new URLSearchParams({
            query: input,           
            agent_id: AGENT_ID,          
            });
            if (sessionId) {
                params.append("thread_id", sessionId);
            }
            const res = await fetch(`${API_BASE_URL}/chat?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            const botMessage: Message = { sender: "bot", text: data.response };
            setSessionId(data.thread_id);
            setMessages((prev) => [...prev, botMessage]);
            setInput("");
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: '⚠️ Sorry, something went wrong.' },
            ]);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    if (!isOpen) {
        return (
            <Button
                hasIconOnly
                renderIcon={ChatLaunch}
                iconDescription="Open chat"
                kind="primary"
                size="lg"
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    borderRadius: '50%',
                    zIndex: 9999,
                }}
                onClick={() => setIsOpen(true)}
            />
        );
    }

    return (
        <Tile
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                width: '420px',
                height: '620px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 10000,
                padding: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                }}
            >
                <h5 style={{ margin: 0 }}>💬 GreenForce Assistant</h5>
                <Button
                    hasIconOnly
                    renderIcon={Close}
                    iconDescription="Close chat"
                    kind="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                />
            </div>

            {/* Chat messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #8c8c8c',
                    borderRadius: 8,
                    padding: '0.5rem',
                    marginBottom: '0.75rem',
                }}
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            justifyContent:
                                msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: 6,
                        }}
                    >
                        <div
                            style={{
                                backgroundColor:
                                    msg.sender === 'user' ? '#0f62fe' : '#e0e0e0',
                                color: msg.sender === 'user' ? '#fff' : '#000',
                                padding: '8px 12px',
                                borderRadius: 16,
                                maxWidth: '80%',
                                wordBreak: 'break-word',
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <TextInput
                    id="chat-input"
                    labelText=""
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                    onKeyPress={handleKeyPress}
                    style={{ flex: 1 }}
                />
                <Button kind="primary" size="sm" onClick={sendMessage}>
                    Send
                </Button>
            </div>
        </Tile>
    );
}
