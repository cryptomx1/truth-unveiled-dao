import { CivicLayoutShell } from '@/components/layout/CivicLayoutShell';
import '@/utils/tts-disable';
import { TTSManager } from '@/components/ui/tts-killer';

export default function CivicShellPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <TTSManager />
      <CivicLayoutShell />
    </div>
  );
}