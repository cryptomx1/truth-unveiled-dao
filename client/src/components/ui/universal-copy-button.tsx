import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UniversalCopyButtonProps {
  content: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showLabel?: boolean;
}

export function UniversalCopyButton({
  content,
  label = 'Copy',
  size = 'sm',
  variant = 'outline',
  className,
  showLabel = true
}: UniversalCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      console.log('📋 Content copied to clipboard for JASMY/Claude collaboration');
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size="sm"
      className={cn(
        sizeClasses[size],
        'gap-1.5 select-none',
        copied && 'bg-green-600/20 border-green-500/50 text-green-400',
        className
      )}
      aria-label={`${copied ? 'Copied' : 'Copy'} ${label.toLowerCase()}`}
    >
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {copied ? 'Copied!' : label}
        </span>
      )}
    </Button>
  );
}