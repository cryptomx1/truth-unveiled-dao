#!/bin/bash

# Additional components that need default exports
components2=(
    "client/src/components/decks/ZKPLayer/ZKProofGeneratorCard.tsx:ZKProofGeneratorCard"
    "client/src/components/decks/ZKPLayer/ZKProofVerifierCard.tsx:ZKProofVerifierCard"
    "client/src/components/decks/ZKPLayer/ZKAuditTrailCard.tsx:ZKAuditTrailCard"
    "client/src/components/decks/SecureAssetsDeck/ProofBoundVaultEntryCard.tsx:ProofBoundVaultEntryCard"
    "client/src/components/decks/SecureAssetsDeck/AssetSignatureViewerCard.tsx:AssetSignatureViewerCard"
    "client/src/components/decks/SecureAssetsDeck/CivicAssetTransferCard.tsx:CivicAssetTransferCard"
    "client/src/components/decks/SecureAssetsDeck/AssetDisputeResolverCard.tsx:AssetDisputeResolverCard"
    "client/src/components/decks/CivicAuditDeck/LedgerAnomalyScannerCard.tsx:LedgerAnomalyScannerCard"
    "client/src/components/decks/CivicAuditDeck/AuditResolutionPanelCard.tsx:AuditResolutionPanelCard"
    "client/src/components/decks/CivicAuditDeck/TransparencyMetricsCard.tsx:TransparencyMetricsCard"
    "client/src/components/decks/ConsensusLayerDeck/VoteConsensusCard.tsx:VoteConsensusCard"
    "client/src/components/decks/ConsensusLayerDeck/ZKProposalLogCard.tsx:ZKProposalLogCard"
    "client/src/components/decks/ConsensusLayerDeck/DeliberationPanelCard.tsx:DeliberationPanelCard"
    "client/src/components/decks/ConsensusLayerDeck/CivicVoteDisputeCard.tsx:CivicVoteDisputeCard"
    "client/src/components/decks/GovernanceFeedbackDeck/SentimentAggregationCard.tsx:SentimentAggregationCard"
    "client/src/components/decks/GovernanceFeedbackDeck/FeedbackImpactAnalyzerCard.tsx:FeedbackImpactAnalyzerCard"
    "client/src/components/decks/GovernanceFeedbackDeck/ZKPFeedbackNodeCard.tsx:ZKPFeedbackNodeCard"
)

for item in "${components2[@]}"; do
    file="${item%:*}"
    component="${item#*:}"
    
    if [ -f "$file" ]; then
        # Check if it already has default export
        if ! grep -q "export default $component" "$file"; then
            echo "Adding export to $component in $file"
            echo "" >> "$file"
            echo "export default $component;" >> "$file"
        else
            echo "Export already exists for $component"
        fi
    fi
done
