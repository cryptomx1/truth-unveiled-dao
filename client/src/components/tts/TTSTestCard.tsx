/**
 * TTSTestCard.tsx
 * TTS Testing Component for Audio Debugging
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2, VolumeX, Play, Pause, TestTube } from 'lucide-react';
import TTSEngineAgent from '@/agents/TTSEngineAgent';

const TTSTestCard: React.FC = () => {
  const [testText, setTestText] = useState('Hello, this is a TTS test. Testing audio generation functionality.');
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string>('');
  const ttsAgent = TTSEngineAgent.getInstance();

  const runBasicTTSTest = async () => {
    setIsTesting(true);
    setLastTestResult('Testing...');
    
    try {
      // Cancel any existing speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Create test utterance
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
      
      return new Promise<string>((resolve) => {
        utterance.onstart = () => {
          console.log('🔊 TTS Test Started');
          setLastTestResult('Audio playing...');
        };
        
        utterance.onend = () => {
          console.log('✅ TTS Test Completed Successfully');
          setLastTestResult('✅ Audio test completed successfully');
          resolve('success');
        };
        
        utterance.onerror = (error) => {
          console.error('❌ TTS Test Failed:', error);
          setLastTestResult(`❌ Audio test failed: ${error.error || 'Unknown error'}`);
          resolve('failed');
        };
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
        
        // Safety timeout
        setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setLastTestResult('⚠️ Test timed out after 10 seconds');
            resolve('timeout');
          }
        }, 10000);
      });
    } catch (error) {
      console.error('TTS Test Error:', error);
      setLastTestResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const runAgentTTSTest = async () => {
    setIsTesting(true);
    setLastTestResult('Testing agent system...');
    
    try {
      await ttsAgent.narrateContent('test-deck', 'test-module', testText, 'high');
      setLastTestResult('✅ Agent TTS test completed');
    } catch (error) {
      console.error('Agent TTS Test Error:', error);
      setLastTestResult(`❌ Agent test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    ttsAgent.stopNarration();
    setLastTestResult('⏹️ Audio stopped');
    setIsTesting(false);
  };

  const checkBrowserSupport = () => {
    const hasAPI = 'speechSynthesis' in window;
    const voices = hasAPI ? window.speechSynthesis.getVoices() : [];
    
    setLastTestResult(`
      Browser Support: ${hasAPI ? '✅ Yes' : '❌ No'}
      Available Voices: ${voices.length}
      Current Status: ${window.speechSynthesis?.speaking ? 'Speaking' : 'Ready'}
    `);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          TTS Audio Test Center
        </CardTitle>
        <CardDescription>
          Test and debug text-to-speech functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Test Text:</label>
          <Input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test audio generation..."
            className="mt-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runBasicTTSTest}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Basic TTS Test
          </Button>
          
          <Button
            onClick={runAgentTTSTest}
            disabled={isTesting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Agent TTS Test
          </Button>
          
          <Button
            onClick={stopAudio}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Stop Audio
          </Button>
          
          <Button
            onClick={checkBrowserSupport}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Check Support
          </Button>
        </div>

        {lastTestResult && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">Test Result:</p>
            <pre className="text-sm mt-1 whitespace-pre-wrap">{lastTestResult}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Troubleshooting:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure browser allows audio autoplay (check site permissions)</li>
            <li>Try clicking once on the page before testing (user interaction required)</li>
            <li>Check if browser has speech synthesis voices installed</li>
            <li>Open browser developer tools to see detailed error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSTestCard;