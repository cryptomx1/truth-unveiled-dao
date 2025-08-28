import React, { useState, useEffect } from 'react';
import { UniversalCopyButton } from './universal-copy-button';

interface GlobalCopyOverlayProps {
  children: React.ReactNode;
  showCopyOnHover?: boolean;
}

export function GlobalCopyOverlay({ 
  children, 
  showCopyOnHover = true 
}: GlobalCopyOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [textContent, setTextContent] = useState('');

  // Extract all text content from children
  const extractTextContent = (element: React.ReactNode): string => {
    if (typeof element === 'string') return element;
    if (typeof element === 'number') return element.toString();
    if (React.isValidElement(element)) {
      if (element.props.children) {
        if (Array.isArray(element.props.children)) {
          return element.props.children.map(extractTextContent).join(' ');
        }
        return extractTextContent(element.props.children);
      }
    }
    if (Array.isArray(element)) {
      return element.map(extractTextContent).join(' ');
    }
    return '';
  };

  useEffect(() => {
    setTextContent(extractTextContent(children));
  }, [children]);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {showCopyOnHover && isHovered && textContent && (
        <div className="absolute top-2 right-2 z-50 opacity-90">
          <UniversalCopyButton
            content={textContent}
            label="Copy Content"
            size="sm"
            showLabel={false}
            className="bg-slate-800/95 border-slate-600/70 text-slate-200 hover:bg-slate-700/95 shadow-lg backdrop-blur-sm"
          />
        </div>
      )}
    </div>
  );
}