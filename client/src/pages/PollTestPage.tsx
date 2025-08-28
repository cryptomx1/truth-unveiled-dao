import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, Clock, CheckCircle } from 'lucide-react';

export default function PollTestPage() {
  const handleCreateTestPoll = () => {
    // Redirect to poll creation with test parameters
    window.location.href = '/poll/create-test';
    console.log('🗳️ Test poll creation initiated');
  };

  const handleAccessDeck10 = () => {
    // Navigate to Deck #10 for TrustVoteCard validation
    window.location.href = '/deck/10';
    console.log('🔧 Deck #10 validation access');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Vote className="w-6 h-6 text-blue-400" />
              <span>Poll Creation & Testing Interface</span>
            </CardTitle>
            <p className="text-slate-300">
              Test poll creation and validate TrustVoteCard + FeedbackZoneEngine
            </p>
          </CardHeader>
        </Card>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poll Creation Test */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="w-5 h-5 text-blue-400" />
                <span>Test Poll Creation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">
                Access the test poll creation interface with pre-configured parameters
              </p>
              
              <div className="space-y-2">
                <Badge className="bg-blue-600">Route: /poll/create-test</Badge>
                <Badge className="bg-green-600">Status: Active</Badge>
              </div>
              
              <Button 
                onClick={handleCreateTestPoll}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Create Test Poll
              </Button>
            </CardContent>
          </Card>

          {/* Deck #10 Validation */}
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Deck #10 Validation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">
                Validate TrustVoteCard and FeedbackZoneEngine components
              </p>
              
              <div className="space-y-2">
                <Badge className="bg-purple-600">Route: /deck/10</Badge>
                <Badge className="bg-amber-600">Component: TrustVoteCard</Badge>
                <Badge className="bg-amber-600">Component: FeedbackZoneEngine</Badge>
              </div>
              
              <Button 
                onClick={handleAccessDeck10}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Access Deck #10
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Status */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Testing Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold mb-1">Poll Creation</h3>
                <p className="text-sm text-slate-400">Test interface ready</p>
                <Badge className="mt-2 bg-green-600">Ready</Badge>
              </div>
              
              <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="font-semibold mb-1">Trust Voting</h3>
                <p className="text-sm text-slate-400">Deck #10 components</p>
                <Badge className="mt-2 bg-green-600">Active</Badge>
              </div>
              
              <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                <Vote className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                <h3 className="font-semibold mb-1">Feedback Engine</h3>
                <p className="text-sm text-slate-400">Zone testing enabled</p>
                <Badge className="mt-2 bg-green-600">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Quick Access</h3>
                <p className="text-sm text-slate-400">Navigate to key testing interfaces</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm"
                  onClick={() => window.location.href = '/command'}
                  className="bg-slate-600 hover:bg-slate-500"
                >
                  Command Center
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = '/poll/analytics'}
                  className="bg-slate-600 hover:bg-slate-500"
                >
                  Poll Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}