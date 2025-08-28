import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Vault, Lock, FileImage, FileAudio, FileText, Eye, EyeOff, Download, User, Calendar, HardDrive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type VaultFileType = 'image' | 'audio' | 'pdf';

interface VaultFile {
  id: string;
  name: string;
  type: VaultFileType;
  size: number; // in MB
  timestamp: Date;
  ownerDID: string;
  maskedDID: string;
  isLocked: boolean;
  previewData?: string;
}

interface VaultAccessCardProps {
  className?: string;
}

interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

const MOCK_VAULT_FILES: VaultFile[] = [
  {
    id: 'vault_img_001',
    name: 'civic_proposal_draft.jpg',
    type: 'image',
    size: 2.4,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    ownerDID: 'user_847n',
    maskedDID: 'anon_k3m7',
    isLocked: true,
    previewData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+'
  },
  {
    id: 'vault_aud_002',
    name: 'encrypted_meeting_rec.mp3',
    type: 'audio',
    size: 15.8,
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    ownerDID: 'user_392x',
    maskedDID: 'anon_p8q2',
    isLocked: true
  },
  {
    id: 'vault_pdf_003',
    name: 'zkp_whitepaper_v2.pdf',
    type: 'pdf',
    size: 8.2,
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    ownerDID: 'user_156z',
    maskedDID: 'anon_n9r4',
    isLocked: true
  }
];

const getFileIcon = (type: VaultFileType) => {
  switch (type) {
    case 'image':
      return <FileImage className="w-4 h-4 text-blue-400" />;
    case 'audio':
      return <FileAudio className="w-4 h-4 text-green-400" />;
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-400" />;
    default:
      return <FileText className="w-4 h-4 text-slate-400" />;
  }
};

const getFileTypeColor = (type: VaultFileType) => {
  switch (type) {
    case 'image':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'audio':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pdf':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const formatFileSize = (sizeMB: number) => {
  if (sizeMB < 1) {
    return `${(sizeMB * 1024).toFixed(0)} KB`;
  }
  return `${sizeMB.toFixed(1)} MB`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than 1h ago';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export const VaultAccessCard: React.FC<VaultAccessCardProps> = ({ className }) => {
  const [vaultFiles] = useState<VaultFile[]>(MOCK_VAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [ttsStatus, setTtsStatus] = useState<TTSStatus>({ isReady: false, isPlaying: false });
  const [renderStartTime] = useState(performance.now());
  const cardRef = useRef<HTMLDivElement>(null);

  // Performance monitoring
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime;
    if (renderTime > 125) {
      console.warn(`VaultAccessCard render time: ${renderTime.toFixed(2)}ms (exceeds 125ms target)`);
    } else {
      console.log(`VaultAccessCard render time: ${renderTime.toFixed(2)}ms ✅`);
    }
  }, [renderStartTime]);

  // TTS Integration
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        if ('speechSynthesis' in window) {
          setTtsStatus(prev => ({ ...prev, isReady: true }));
          
          // Auto-play vault session message on mount
          const utterance = new SpeechSynthesisUtterance("Vault session started.");
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

  const playPreviewTTS = (fileType: VaultFileType) => {
    if (!ttsStatus.isReady) return;
    
    const message = `Previewing secure ${fileType}.`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    setTtsStatus(prev => ({ ...prev, isPlaying: true }));
    speechSynthesis.speak(utterance);
    
    utterance.onend = () => {
      setTtsStatus(prev => ({ ...prev, isPlaying: false }));
    };
  };

  const handleFilePreview = (file: VaultFile) => {
    const previewStart = performance.now();
    
    setSelectedFile(file);
    playPreviewTTS(file.type);
    
    const previewTime = performance.now() - previewStart;
    if (previewTime > 50) {
      console.warn(`File preview time: ${previewTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const handleClosePreview = () => {
    const closeStart = performance.now();
    
    setSelectedFile(null);
    
    const closeTime = performance.now() - closeStart;
    if (closeTime > 50) {
      console.warn(`Close preview time: ${closeTime.toFixed(2)}ms (exceeds 50ms target)`);
    }
  };

  const renderBlurredPreview = (file: VaultFile) => {
    if (file.type === 'image') {
      return (
        <div className="relative bg-slate-700/50 rounded-lg h-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex items-center justify-center">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-xs text-slate-500 absolute bottom-2 left-2">
            {file.name}
          </div>
        </div>
      );
    }
    
    if (file.type === 'audio') {
      return (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileAudio className="w-6 h-6 text-green-400" />
            <div className="flex-1">
              <div className="text-sm text-slate-300">{file.name}</div>
              <div className="text-xs text-slate-500">Audio File • {formatFileSize(file.size)}</div>
            </div>
          </div>
          <div className="relative bg-slate-800/50 rounded h-12 flex items-center justify-center">
            <Lock className="w-5 h-5 text-slate-400" />
            <div className="absolute inset-0 bg-slate-900/60 rounded flex items-center justify-center">
              <span className="text-xs text-slate-500">Encrypted Audio</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (file.type === 'pdf') {
      return (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-red-400" />
            <div className="flex-1">
              <div className="text-sm text-slate-300">{file.name}</div>
              <div className="text-xs text-slate-500">PDF Document • {formatFileSize(file.size)}</div>
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((page) => (
              <div key={page} className="relative bg-slate-800/50 rounded h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-900/60 rounded flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xs text-slate-500">Page {page}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
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
      aria-label="Secure File Vault Access"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Vault className="w-5 h-5 text-blue-400" />
            Secure Vault
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
                <p>Decryption requires ZKP Layer (Deck #6)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-slate-300 text-sm">
          Access encrypted files with zero-knowledge privacy
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vault Status */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-300">Vault Active</span>
            </div>
            <span className="text-xs text-slate-400">{vaultFiles.length} files</span>
          </div>
          <div className="text-xs text-slate-500">
            All files are encrypted and require ZKP authentication
          </div>
        </div>

        {/* File List */}
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50">
          <ScrollArea className="h-64 p-4">
            <div className="space-y-3" aria-live="polite" aria-label="Vault file list">
              {vaultFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-700/30 rounded-lg border border-slate-600/50 p-3 cursor-pointer hover:bg-slate-600/30 transition-colors"
                  onClick={() => handleFilePreview(file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Preview ${file.name}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFilePreview(file);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <HardDrive className="w-3 h-3" />
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimeAgo(file.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <User className="w-3 h-3" />
                        <span>Owner: {file.maskedDID}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-xs', getFileTypeColor(file.type))}>
                        {file.type.toUpperCase()}
                      </Badge>
                      {file.isLocked && (
                        <Lock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-100">Preview</span>
              </div>
              <Button
                onClick={handleClosePreview}
                variant="ghost"
                size="sm"
                className="min-h-[48px] px-3 text-slate-400 hover:text-slate-200"
                aria-label="Close preview"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </div>
            
            {renderBlurredPreview(selectedFile)}
            
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-xs text-slate-400 space-y-1">
                <div>• File is encrypted and cannot be fully previewed</div>
                <div>• ZKP authentication required for decryption</div>
                <div>• Owner: {selectedFile.maskedDID}</div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={cn(
                    'flex-1 min-h-[48px]',
                    'bg-slate-700/50 border-slate-600 text-slate-500',
                    'cursor-not-allowed'
                  )}
                  aria-label="Download file (requires ZKP authentication)"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className={cn(
                    'flex-1 min-h-[48px]',
                    'bg-slate-700/50 border-slate-600 text-slate-500',
                    'cursor-not-allowed'
                  )}
                  aria-label="Decrypt file (requires ZKP authentication)"
                >
                  <Lock className="w-3 h-3 mr-2" />
                  Decrypt
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Vault Actions */}
        {!selectedFile && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className={cn(
                'w-full min-h-[48px] font-medium',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              disabled
              aria-label="Upload new file (requires ZKP authentication)"
            >
              <Vault className="w-4 h-4 mr-2" />
              Upload to Vault
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                'w-full min-h-[48px] font-medium',
                'bg-slate-700/50 border-slate-600 text-slate-200',
                'hover:bg-slate-600/70 hover:text-slate-50'
              )}
              disabled
              aria-label="Manage vault access (requires ZKP authentication)"
            >
              <Lock className="w-4 h-4 mr-2" />
              Manage Access
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Zero-knowledge encrypted file storage
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
export default VaultAccessCard;
