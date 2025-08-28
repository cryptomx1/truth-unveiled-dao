import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Shield, Scan, Eye, RotateCcw, AlertTriangle } from "lucide-react";

interface CertificationRecord {
  id: string;
  certificateHash: string;
  learnerDID: string;
  curriculum: string;
  issueDate: string;
  zkpHash: string;
  isValid: boolean;
  issuer: string;
  credentialType: string;
}

interface VerificationResult {
  certificateHash: string;
  isValid: boolean;
  matchedRecord?: CertificationRecord;
  verificationTime: number;
  zkpVerified: boolean;
  crossDeckSync: boolean;
  timestamp: string;
}

// Mock certification database with ZKP hashes from Deck #12 and Module #1
const mockCertifications: CertificationRecord[] = [
  {
    id: "cert_001",
    certificateHash: "0x7f3e2d1a9b5c",
    learnerDID: "did:civic:learn_001",
    curriculum: "Civic Basics",
    issueDate: "2025-07-10",
    zkpHash: "0x9a2f...1d3e", // Links to DIDClaimCard
    isValid: true,
    issuer: "TruthUnveiled Academy",
    credentialType: "completion"
  },
  {
    id: "cert_002", 
    certificateHash: "0x4c8f1e6d2a9b",
    learnerDID: "did:civic:learn_002",
    curriculum: "Policy Law",
    issueDate: "2025-07-12",
    zkpHash: "0x5e8a...7c2f", // Links to ZKPLearningModuleCard
    isValid: true,
    issuer: "Civic Education DAO",
    credentialType: "assessment"
  },
  {
    id: "cert_003",
    certificateHash: "0x1b7d5f8e3c4a",
    learnerDID: "did:civic:learn_003", 
    curriculum: "Constitutional Law",
    issueDate: "2025-07-14",
    zkpHash: "0x2c9b...4e6d", // Invalid for testing
    isValid: false,
    issuer: "Constitutional Institute",
    credentialType: "certification"
  }
];

export default function CertificationVerificationCard() {
  const [inputHash, setInputHash] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "scanning" | "verifying" | "completed" | "failed">("idle");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);
  const [zkpMismatch, setZkpMismatch] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [crossDeckSyncStatus, setCrossDeckSyncStatus] = useState<"pending" | "synced" | "failed">("pending");
  const startTimeRef = useRef<number>(0);

  // TTS setup with proper cleanup
  const [ttsSupported, setTtsSupported] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setTtsSupported('speechSynthesis' in window);
    
    // TTS announcement on mount
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Certificate verification interface ready");
      utterance.rate = 0.9;
      utterance.volume = 0.7;
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }

    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // ZKP mismatch simulation with 15% failure rate
  useEffect(() => {
    if (verificationStatus === "verifying") {
      const mismatchRate = Math.random();
      const isMismatch = mismatchRate < 0.15; // 15% mismatch rate
      
      if (isMismatch) {
        setZkpMismatch(true);
        console.warn("⚠️ Certificate verification mismatch: 15.0% rate (exceeds 10% threshold)");
        
        // Path B retry mechanism
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setZkpMismatch(false);
          setCrossDeckSyncStatus("synced");
          
          if (ttsSupported) {
            const retryUtterance = new SpeechSynthesisUtterance("Verification retry successful");
            retryUtterance.rate = 0.9;
            retryUtterance.volume = 0.7;
            speechSynthesis.speak(retryUtterance);
          }
        }, 2000);
      } else {
        setCrossDeckSyncStatus("synced");
      }
    }
  }, [verificationStatus, ttsSupported]);

  const handleScanCertificate = () => {
    if (!inputHash.trim()) return;

    setVerificationStatus("scanning");
    startTimeRef.current = Date.now();
    
    setTimeout(() => {
      setVerificationStatus("verifying");
      
      setTimeout(() => {
        const verificationTime = Date.now() - startTimeRef.current;
        const matchedRecord = mockCertifications.find(cert => 
          cert.certificateHash === inputHash.trim()
        );
        
        const isValid = matchedRecord ? matchedRecord.isValid : false;
        const zkpVerified = !zkpMismatch && isValid;
        const crossDeckSync = crossDeckSyncStatus === "synced";
        
        const result: VerificationResult = {
          certificateHash: inputHash.trim(),
          isValid,
          matchedRecord,
          verificationTime,
          zkpVerified,
          crossDeckSync,
          timestamp: new Date().toISOString()
        };
        
        setVerificationResult(result);
        setVerificationHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5
        setVerificationStatus(isValid && zkpVerified ? "completed" : "failed");
        
        // TTS announcement
        if (ttsSupported) {
          const message = isValid && zkpVerified ? "Certificate verified" : "Verification failed";
          const verifyUtterance = new SpeechSynthesisUtterance(message);
          verifyUtterance.rate = 0.9;
          verifyUtterance.volume = 0.7;
          speechSynthesis.speak(verifyUtterance);
        }
      }, 1500); // Verification processing time
    }, 500); // Scanning time
  };

  const handleReset = () => {
    setInputHash("");
    setVerificationStatus("idle");
    setVerificationResult(null);
    setZkpMismatch(false);
    setRetryCount(0);
    setCrossDeckSyncStatus("pending");
  };

  const handleQRScan = () => {
    // Simulate QR scan with random valid hash
    const validHashes = mockCertifications.map(cert => cert.certificateHash);
    const randomHash = validHashes[Math.floor(Math.random() * validHashes.length)];
    setInputHash(randomHash);
    
    if (ttsSupported) {
      const scanUtterance = new SpeechSynthesisUtterance("QR code scanned");
      scanUtterance.rate = 0.9;
      scanUtterance.volume = 0.7;
      speechSynthesis.speak(scanUtterance);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "completed":
        return verificationResult?.isValid && verificationResult?.zkpVerified ? "text-green-400" : "text-red-400";
      case "failed":
        return "text-red-400";
      case "scanning":
      case "verifying":
        return "text-amber-400";
      default:
        return "text-slate-300";
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "completed":
        return verificationResult?.isValid && verificationResult?.zkpVerified ? 
          <CheckCircle2 className="h-5 w-5 text-green-400" /> : 
          <XCircle className="h-5 w-5 text-red-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "scanning":
      case "verifying":
        return <Clock className="h-4 w-4 text-amber-400 animate-spin" />;
      default:
        return <Shield className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-blue-400 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Certificate Verification
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>Cross-Deck Sync:</span>
          <Badge 
            variant={crossDeckSyncStatus === "synced" ? "default" : crossDeckSyncStatus === "failed" ? "destructive" : "secondary"}
            className={`text-xs ${
              crossDeckSyncStatus === "synced" ? "bg-blue-600 hover:bg-blue-700" :
              crossDeckSyncStatus === "failed" ? "bg-red-600 hover:bg-red-700" :
              "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {crossDeckSyncStatus === "synced" ? "Synced" : crossDeckSyncStatus === "failed" ? "Failed" : "Pending"}
          </Badge>
          {zkpMismatch && (
            <span className="text-amber-400 text-xs animate-pulse">Path B Active</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Certificate Hash Input</label>
          <div className="flex gap-2">
            <Input
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="0x7f3e2d1a9b5c or scan QR"
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
              disabled={verificationStatus === "scanning" || verificationStatus === "verifying"}
            />
            <Button
              onClick={handleQRScan}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={verificationStatus === "scanning" || verificationStatus === "verifying"}
            >
              <Scan className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {verificationStatus !== "idle" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-md">
              {getStatusIcon()}
              <div className="flex-1">
                <div className={`text-sm font-medium ${getStatusColor()}`}>
                  {verificationStatus === "scanning" && "Scanning certificate..."}
                  {verificationStatus === "verifying" && "Verifying with ZKP..."}
                  {verificationStatus === "completed" && (
                    verificationResult?.isValid && verificationResult?.zkpVerified ? 
                    "Certificate Verified" : "Verification Failed"
                  )}
                  {verificationStatus === "failed" && "Verification Failed"}
                </div>
                {verificationResult && (
                  <div className="text-xs text-slate-400 mt-1">
                    Processing time: {verificationResult.verificationTime}ms
                  </div>
                )}
              </div>
            </div>

            {zkpMismatch && (
              <div className="flex items-center gap-2 p-2 bg-amber-900/30 border border-amber-600 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-400">
                  ZKP mismatch detected - Path B retry in progress
                </span>
              </div>
            )}
          </div>
        )}

        {verificationResult && verificationResult.matchedRecord && (
          <div className="space-y-3">
            <Separator className="bg-slate-600" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Certificate Details</h4>
              <div className="p-3 bg-slate-700 rounded-md space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Curriculum:</span>
                  <span className="text-white">{verificationResult.matchedRecord.curriculum}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Learner DID:</span>
                  <code className="text-blue-400 font-mono text-xs">
                    {verificationResult.matchedRecord.learnerDID}
                  </code>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Issue Date:</span>
                  <span className="text-white">{verificationResult.matchedRecord.issueDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Issuer:</span>
                  <span className="text-white">{verificationResult.matchedRecord.issuer}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Type:</span>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                    {verificationResult.matchedRecord.credentialType}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">ZKP Hash:</span>
                  <code className="text-green-400 font-mono text-xs">
                    {verificationResult.matchedRecord.zkpHash}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleScanCertificate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!inputHash.trim() || verificationStatus === "scanning" || verificationStatus === "verifying"}
          >
            {verificationStatus === "scanning" || verificationStatus === "verifying" ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify
              </>
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {verificationHistory.length > 0 && (
          <>
            <Separator className="bg-slate-600" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Recent Verifications
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {verificationHistory.map((result, index) => (
                  <div key={index} className="p-2 bg-slate-700 rounded-md">
                    <div className="flex items-center justify-between text-xs">
                      <code className="font-mono text-slate-400">
                        {result.certificateHash.slice(0, 12)}...
                      </code>
                      <div className="flex items-center gap-1">
                        {result.isValid && result.zkpVerified ? (
                          <CheckCircle2 className="h-3 w-3 text-green-400" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-400" />
                        )}
                        <span className={result.isValid && result.zkpVerified ? "text-green-400" : "text-red-400"}>
                          {result.isValid && result.zkpVerified ? "Valid" : "Invalid"}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatTimestamp(result.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="bg-slate-600" />
        
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Verification Engine:</span>
            <code className="font-mono">ZKP-CV-v2.1</code>
          </div>
          <div className="flex justify-between">
            <span>Deck Sync Status:</span>
            <span className="text-blue-400">Deck #12 + #16.1</span>
          </div>
          {retryCount > 0 && (
            <div className="flex justify-between">
              <span>Path B Retries:</span>
              <span className="text-amber-400">{retryCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}