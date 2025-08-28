import React from 'react';
import { UniversalCopyButton } from './universal-copy-button';
import { cn } from '@/lib/utils';

interface ContentCopyWrapperProps {
  children: React.ReactNode;
  copyContent?: string;
  showCopyButton?: boolean;
  label?: string;
  className?: string;
}

export function ContentCopyWrapper({
  children,
  copyContent,
  showCopyButton = true,
  label = 'Copy Content',
  className
}: ContentCopyWrapperProps) {
  // Extract text content from children if copyContent not provided
  const getTextContent = (element: React.ReactNode): string => {
    if (typeof element === 'string') return element;
    if (typeof element === 'number') return element.toString();
    if (React.isValidElement(element)) {
      if (element.props.children) {
        if (Array.isArray(element.props.children)) {
          return element.props.children.map(getTextContent).join(' ');
        }
        return getTextContent(element.props.children);
      }
    }
    return '';
  };

  const contentToCopy = copyContent || getTextContent(children);

  return (
    <div className={cn('group relative', className)}>
      {children}
      {showCopyButton && contentToCopy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <UniversalCopyButton
            content={contentToCopy}
            label={label}
            variant="ghost"
            size="sm"
            className="bg-slate-800/90 border-slate-600/50 text-slate-300 hover:bg-slate-700/90"
            showLabel={false}
          />
        </div>
      )}
    </div>
  );
}