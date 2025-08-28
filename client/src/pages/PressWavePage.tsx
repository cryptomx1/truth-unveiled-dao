import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, TrendingUp, QrCode, Users, Globe } from 'lucide-react';
import SocialMomentumCard from '@/components/presswave/SocialMomentumCard';
import QRShareModule from '@/components/presswave/QRShareModule';
import DAOReactionTallyCard from '@/components/presswave/DAOReactionTallyCard';
import GlobalEngagementHeatmap from '@/components/presswave/GlobalEngagementHeatmap';
import RepDissonanceEngine from '@/components/press/RepDissonanceEngine';

const PressWavePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Share2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Press Wave
            </h1>
            <Badge variant="outline" className="text-xs">
              Phase PRESS-WAVE Step 1
            </Badge>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Social amplification dashboard for Truth Unveiled Civic Genome platform distribution and momentum tracking
          </p>
        </div>

        {/* Authority Badge */}
        <div className="flex justify-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-700 dark:text-slate-300">
                  <strong>Authority:</strong> Commander Mark via JASMY Relay System
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Momentum Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Social Momentum Tracking
            </h2>
          </div>
          <div className="flex justify-center">
            <SocialMomentumCard />
          </div>
        </section>

        {/* QR Share Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <QrCode className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              QR Code Generator
            </h2>
          </div>
          <div className="flex justify-center">
            <QRShareModule />
          </div>
        </section>

        {/* DAO Reaction Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              DAO Sentiment Tracking
            </h2>
          </div>
          <div className="flex justify-center">
            <DAOReactionTallyCard />
          </div>
        </section>

        {/* Global Engagement Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Global Engagement Analysis
            </h2>
          </div>
          <div className="flex justify-center">
            <GlobalEngagementHeatmap />
          </div>
        </section>

        {/* Platform Links */}
        <section className="space-y-4">
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 text-center">
            Platform Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Main Platform</CardTitle>
                <CardDescription className="text-xs font-mono">
                  gateway.pinata.cloud/ipfs/bafybeirtkz5k4yb...
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Press Release</CardTitle>
                <CardDescription className="text-xs font-mono">
                  .../press-release
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Command Center</CardTitle>
                <CardDescription className="text-xs font-mono">
                  .../command
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Representative Dissonance Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-sm font-bold">📊</div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Representative Dissonance Engine
            </h2>
            <Badge variant="secondary">Phase PRESS-REPLAY Step 3</Badge>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-7xl">
              <RepDissonanceEngine />
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <p>Truth Unveiled Civic Genome v1.1 - Press Wave Distribution System</p>
          <p>Real-time social amplification and QR sharing capabilities</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressWavePage;