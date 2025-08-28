import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Download, Copy, Share2, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QROption {
  path: string;
  label: string;
  description: string;
}

const QRShareModule: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState('/');
  const [customPath, setCustomPath] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseCID = 'bafybeirtkz5k4yb6caagedpwgjrdlvgmtlawezrtkz5k4yb6caagedpwgj';
  const baseURL = `https://gateway.pinata.cloud/ipfs/${baseCID}`;

  const predefinedPaths: QROption[] = [
    { path: '/', label: 'Platform Home', description: 'Main civic engagement dashboard' },
    { path: '/press-release', label: 'Press Release', description: 'Official press release and media kit' },
    { path: '/deck/1', label: 'Wallet Overview', description: 'Civic identity and wallet management' },
    { path: '/deck/2', label: 'Governance', description: 'Civic voting and proposal system' },
    { path: '/deck/10', label: 'Governance Feedback', description: 'Community feedback and sentiment' },
    { path: '/vault/analyzer', label: 'Vault Analyzer', description: 'ZKP verification and audit trail' },
    { path: '/command', label: 'Command Center', description: 'Developer and admin interface' }
  ];

  const getCurrentPath = () => {
    if (selectedPath === 'custom') {
      return customPath || '/';
    }
    return selectedPath;
  };

  const getFullURL = () => {
    const path = getCurrentPath();
    return `${baseURL}${path}`;
  };

  const copyToClipboard = async () => {
    try {
      const url = getFullURL();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      console.log(`📋 URL copied to clipboard: ${url}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-canvas svg') as SVGElement;
    if (svg) {
      const path = getCurrentPath();
      const filename = `truth-unveiled-qr${path.replace(/\//g, '-') || '-home'}.svg`;
      
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = svgUrl;
      link.click();
      
      URL.revokeObjectURL(svgUrl);
      console.log(`📤 QR generated for ${path}`);
    }
  };

  const shareQR = async () => {
    const url = getFullURL();
    const path = getCurrentPath();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Truth Unveiled - ${predefinedPaths.find(p => p.path === path)?.label || 'Civic Platform'}`,
          text: 'Check out the Truth Unveiled Civic Genome Platform',
          url: url
        });
        console.log(`📤 QR shared for ${path}`);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const selectedOption = predefinedPaths.find(option => option.path === selectedPath);

  return (
    <Card className="w-full max-w-2xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <QrCode className="h-5 w-5 text-blue-600" />
          QR Share Module
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Generate shareable QR codes for any civic platform route
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Path Selection */}
        <div className="space-y-3">
          <Label htmlFor="path-select" className="text-slate-700 dark:text-slate-300">
            Select Platform Route
          </Label>
          <Select value={selectedPath} onValueChange={setSelectedPath}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a platform route" />
            </SelectTrigger>
            <SelectContent>
              {predefinedPaths.map((option) => (
                <SelectItem key={option.path} value={option.path}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-slate-500">{option.path}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <div className="flex flex-col">
                  <span className="font-medium">Custom Path</span>
                  <span className="text-xs text-slate-500">Enter your own route</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {selectedPath === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-path" className="text-slate-700 dark:text-slate-300">
                Custom Path
              </Label>
              <Input
                id="custom-path"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="/your/custom/path"
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Route Description */}
        {selectedOption && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedOption.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedOption.description}
                </p>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedOption.path}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          <div 
            id="qr-code-canvas"
            className="bg-white p-4 rounded-lg shadow-sm border"
            role="img"
            aria-label={`QR Code for Civic Route ${getCurrentPath()}`}
          >
            <QRCodeSVG
              value={getFullURL()}
              size={qrSize}
              level="M"
              includeMargin={true}
            />
          </div>
          
          {/* QR Size Control */}
          <div className="flex items-center gap-4">
            <Label className="text-sm text-slate-600 dark:text-slate-400">Size:</Label>
            <div className="flex gap-2">
              {[128, 256, 384].map((size) => (
                <Button
                  key={size}
                  variant={qrSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQrSize(size)}
                  className="text-xs"
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* URL Preview */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Generated URL</Label>
          <div className="flex items-center gap-2">
            <Input
              value={getFullURL()}
              readOnly
              className="font-mono text-xs bg-slate-50 dark:bg-slate-800"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={downloadQR}
            className="flex items-center gap-2 flex-1"
            variant="default"
          >
            <Download className="h-4 w-4" />
            Download QR
          </Button>
          
          <Button 
            onClick={shareQR}
            variant="outline"
            className="flex items-center gap-2 flex-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Scan to visit this module instantly
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Mobile users can scan this QR code to directly access the selected civic platform route. 
                Works with any QR code scanner app or mobile camera.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Formatting Info */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Mobile optimized • Responsive design • Universal QR compatibility
        </div>
      </CardContent>
    </Card>
  );
};

export default QRShareModule;