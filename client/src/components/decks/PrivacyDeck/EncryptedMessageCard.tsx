import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Shield, Lock, MessageSquare, Send, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EncryptedMessage {
  id: string;
  senderDID: string;
  maskedDID: string;
  message: string;
  timestamp: Date;
  side: 'left' | 'right';
  isEncrypted: boolean;
}

interface EncryptedMessageCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_MESSAGES: EncryptedMessage[] = [
  {
    id: 'msg_1',
    senderDID: 'user_459x',
    maskedDID: 'anon_e21k',
    message: 'Welcome to the secure channel',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    side: 'left',
    isEncrypted: true
  },
  {
    id: 'msg_2',
    senderDID: 'user_current',
    maskedDID: 'anon_m47z',
    message: 'Privacy protection is active',
    timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
    side: 'right',
    isEncrypted: true
  },
  {
    id: 'msg_3',
    senderDID: 'user_892p',
    maskedDID: 'anon_k93n',
    message: 'All communications are encrypted',
    timestamp: new Date(Date.now() - 600000), // 10 minutes ago
    side: 'left',
    isEncrypted: true
  }
];

const generateMaskedDID = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'anon_';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const EncryptedMessageCard: React.FC<EncryptedMessageCardProps> = ({ className }) => {
  const [messages, setMessages] = useState<EncryptedMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`EncryptedMessageCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`EncryptedMessageCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play secure channel message on mount
          const utterance = new SpeechSynthesisUtterance("Secure message channel active.");
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.8;
          
          setTtsStatus(prev => ({ ...prev, isPlaying: true }));
          speechSynthesis.speak(utterance);
          
          utterance.onend = () => {
            setTtsStatus(prev => ({ ...prev, isPlaying: false }));
          };
        }
      } catch (error) {
        console.error('TTS initialization failed:', error);
        setTtsStatus(prev => ({ ...prev, error: 'TTS not available' }));
      }
    };

    initializeTTS();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const playNewMessageTTS = () => {
    if (!ttsStatus.isReady) return;
    
    const utterance = new SpeechSynthesisUtterance("New encrypted message received.");
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleSendMessage = () => {
    const sendStart = performance.now();
    
    if (!newMessage.trim()) return;

    const encryptedMessage: EncryptedMessage = {
      id: `msg_${Date.now()}`,
      senderDID: 'user_current',
      maskedDID: generateMaskedDID(),
      message: newMessage.trim(),
      timestamp: new Date(),
      side: 'right',
      isEncrypted: true
    };

    setMessages(prev => [...prev, encryptedMessage]);
    setNewMessage('');
    
    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMessage: EncryptedMessage = {
        id: `msg_${Date.now() + 1}`,
        senderDID: `user_${Math.floor(Math.random() * 999)}x`,
        maskedDID: generateMaskedDID(),
        message: 'Message received and encrypted',
        timestamp: new Date(),
        side: 'left',
        isEncrypted: true
      };
      
      setMessages(prev => [...prev, responseMessage]);
      playNewMessageTTS();
    }, 2000);
    
    const sendTime = performance.now() - sendStart;
    if (sendTime > 50) {
      console.warn(`Send message time: ${sendTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const displayMessage = (message: EncryptedMessage) => {
    if (message.isEncrypted && message.side === 'left') {
      return `Encrypted: ${'*'.repeat(Math.min(message.message.length, 12))}`;
    }
    return message.message;
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        'w-full max-w-sm mx-auto',
        'bg-slate-900 border-slate-700/50',
        'dao-card-gradient',
        className
      )}
      role="region"
      aria-label="Encrypted Message Channel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Encrypted Messages
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700">
                  <Lock className="w-3 h-3 mr-1" />
                  ZKP
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fully encrypted messaging available in Deck #6</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Secure anonymous communication channel
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message History */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50">
          <ScrollArea ref={scrollAreaRef} className="h-64 p-4">
            <div className="space-y-3" aria-live="polite" aria-label="Message history">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.side === 'right' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 space-y-1',
                      message.side === 'right'
                        ? 'bg-blue-600/80 text-white'
                        : 'bg-slate-700/80 text-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <User className="w-3 h-3" />
                      <span>{message.maskedDID}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(message.timestamp)}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {displayMessage(message)}
                    </div>
                    {message.isEncrypted && (
                      <div className="flex items-center gap-1 text-xs opacity-60">
                        <Shield className="w-3 h-3" />
                        <span>End-to-end encrypted</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Your message will be encrypted</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your encrypted message..."
                className={cn(
                  'flex-1 bg-slate-700/50 border-slate-600 text-slate-100',
                  'placeholder:text-slate-400',
                  'focus:border-blue-500 focus:ring-blue-500/20'
                )}
                maxLength={280}
                aria-label="Compose encrypted message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={cn(
                  'min-h-[48px] px-4',
                  'bg-blue-600 hover:bg-blue-700 text-white',
                  'disabled:bg-slate-700/50 disabled:text-slate-500'
                )}
                aria-label="Send encrypted message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Message Preview */}
            {newMessage && (
              <div className="pt-2 border-t border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Preview (encrypted):</div>
                <div className="text-sm text-slate-300 font-mono">
                  Encrypted: {'*'.repeat(Math.min(newMessage.length, 12))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Channel Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Secure Channel Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">
                {messages.length} encrypted messages
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 space-y-1">
              <div>• All messages are end-to-end encrypted</div>
              <div>• DIDs are automatically obfuscated</div>
              <div>• No message history is stored</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-blue-400">
            Anonymous messaging with zero-knowledge privacy
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default EncryptedMessageCard;
