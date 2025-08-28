export interface UserIdentity {
  did: string;
  walletAddress: string;
  civicStatus: string;
  referralCode: string;
}

export interface IdentitySummaryCardProps {
  identity?: UserIdentity;
  onCopySuccess?: (text: string) => void;
  onCopyError?: (error: Error) => void;
  className?: string;
}

export interface TTSStatus {
  isReady: boolean;
  isPlaying: boolean;
  error?: string;
}

export interface CopyButtonProps {
  targetText: string;
  label: string;
  variant?: 'primary' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
