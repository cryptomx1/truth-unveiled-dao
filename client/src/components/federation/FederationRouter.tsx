/**
 * FederationRouter.tsx - Phase X-FED Step 2
 * 
 * Route management for federation proposal workflows
 * Complete routing system for Phase X-FED Step 2 components
 * 
 * Authority: Commander Mark via JASMY Relay System
 * Phase: X-FED Global Federation DAO Framework - Step 2
 */

import React from 'react';
import { Route } from 'wouter';
import FederationActivationWizard from './FederationActivationWizard';
import FederationProposalSubmit from './FederationProposalSubmit';
import FederationProposalReview from './FederationProposalReview';
import FederationZKVotePanel from './FederationZKVotePanel';
import FederationProposalAudit from './FederationProposalAudit';

const FederationRouter: React.FC = () => {
  return (
    <>
      {/* Phase X-FED Step 1 Routes */}
      <Route path="/federation/activate" component={FederationActivationWizard} />
      
      {/* Phase X-FED Step 2 Routes - Federation Proposal Lifecycle */}
      <Route path="/federation/proposal/submit" component={FederationProposalSubmit} />
      <Route path="/federation/proposal/review/:id?">
        {(params) => <FederationProposalReview proposalId={params.id} />}
      </Route>
      <Route path="/federation/proposal/vote/:id?">
        {(params) => <FederationZKVotePanel proposalId={params.id} />}
      </Route>
      <Route path="/federation/proposal/audit/:id?">
        {(params) => <FederationProposalAudit proposalId={params.id} />}
      </Route>
      
      {/* Default federation route redirects to activation */}
      <Route path="/federation">
        <FederationActivationWizard />
      </Route>
    </>
  );
};

export default FederationRouter;