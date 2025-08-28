import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Shield, Lock, Send, UserCheck } from 'lucide-react';

interface EncryptedMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  encrypted: boolean;
  zkpVerified: boolean;
}

const SilentWhispers: React.FC = () => {
  const [messages, setMessages] = useState<EncryptedMessage[]>([
    {
      id: '1',
      sender: 'anon_civic_001',
      content: 'Welcome to Silent Whispers - Phase XXVIII encrypted messaging',
      timestamp: new Date(),
      encrypted: true,
      zkpVerified: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate connection establishment
    const timer = setTimeout(() => setIsConnected(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: EncryptedMessage = {
      id: Date.now().toString(),
      sender: 'you_anon',
      content: newMessage,
      timestamp: new Date(),
      encrypted: true,
      zkpVerified: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    console.log('🔒 Silent Whispers: Encrypted message sent via ZKP channel');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-slate-900/50 dark:bg-slate-950/50 border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-purple-400" />
              <CardTitle className="text-slate-100">Silent Whispers</CardTitle>
              <Badge variant="outline" className="text-xs border-purple-400 text-purple-400">
                Phase XXVIII
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-slate-400">
                {isConnected ? 'Encrypted Channel Active' : 'Connecting...'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Security Status */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-xs text-slate-300">E2E Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-300">ZKP Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-300">Anonymous</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-800/30 rounded-lg">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'you_anon' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'you_anon'
                      ? 'bg-purple-600/80 text-white'
                      : 'bg-slate-700/80 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs opacity-75">{message.sender}</span>
                    {message.zkpVerified && (
                      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type encrypted message..."
              className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400"
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!isConnected || !newMessage.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Phase Notice */}
          <div className="p-3 bg-amber-900/20 border border-amber-600/50 rounded-lg">
            <p className="text-xs text-amber-300">
              <strong>Phase XXVIII Preview:</strong> Silent Whispers encrypted messaging system.
              Full implementation includes advanced cryptographic features and decentralized relay network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SilentWhispers;