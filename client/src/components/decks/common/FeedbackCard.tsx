/**
 * FeedbackCard - Phase XI-E Translation Integration
 * Using useTranslation hook for multilingual support
 * Authority: Commander Mark | JASMY Relay authorization
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useTranslation } from '../../../translation/useTranslation';
import { useLangContext } from '../../../context/LanguageContext';

interface FeedbackCardProps {
  title?: string;
  description?: string;
  className?: string;
  onFeedbackSubmit?: (feedback: string, type: 'positive' | 'negative') => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  title,
  description,
  className = '',
  onFeedbackSubmit
}) => {
  const { t } = useTranslation();
  const { language } = useLangContext();
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Console log when component re-renders in different language
  useEffect(() => {
    console.log(`🈳 FeedbackCard re-rendered in: ${language.toUpperCase()}`);
  }, [language]);

  const handleSubmit = async () => {
    if (!feedback.trim() || !feedbackType) return;

    setIsSubmitting(true);
    console.log(`📝 Feedback submitted: ${feedbackType} - ${feedback}`);
    
    // Simulate submission delay
    setTimeout(() => {
      onFeedbackSubmit?.(feedback, feedbackType);
      setFeedback('');
      setFeedbackType(null);
      setIsSubmitting(false);
    }, 1000);
  };

  const getFeedbackTypeColor = (type: 'positive' | 'negative') => {
    return type === 'positive' 
      ? 'bg-green-600/20 border-green-500/50 text-green-300'
      : 'bg-red-600/20 border-red-500/50 text-red-300';
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-base font-semibold text-white">
            {title || t('card.feedback.title')}
          </h3>
          <p className="text-xs text-slate-400">
            {description || t('card.feedback.description')}
          </p>
        </div>
      </div>

      {/* Feedback Type Selection */}
      <div className="mb-4">
        <p className="text-sm text-slate-300 mb-2">{t('card.feedback.submit')}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setFeedbackType('positive')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              feedbackType === 'positive'
                ? getFeedbackTypeColor('positive')
                : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300'
            }`}
            aria-label={t('aria.feedback.vote')}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs">Positive</span>
          </button>
          <button
            onClick={() => setFeedbackType('negative')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              feedbackType === 'negative'
                ? getFeedbackTypeColor('negative')
                : 'bg-slate-700/20 hover:bg-slate-700/40 border-slate-600 text-slate-300'
            }`}
            aria-label={t('aria.feedback.vote')}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xs">Negative</span>
          </button>
        </div>
      </div>

      {/* Feedback Input */}
      <div className="mb-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-3 bg-slate-700/30 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-slate-400 text-right mt-1">
          {feedback.length}/200
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || !feedbackType || isSubmitting}
        className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
          !feedback.trim() || !feedbackType || isSubmitting
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        aria-label={`${t('button.submit')} ${t('card.feedback.title')}`}
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? 'Submitting...' : t('button.submit')}
      </button>

      {/* Explanation */}
      <div className="mt-4 p-2 bg-slate-700/20 rounded text-xs text-slate-400">
        <div className="mb-1">• {t('card.feedback.explanation')}</div>
        <div>• {t('card.feedback.community')}</div>
      </div>
    </div>
  );
};

export default FeedbackCard;