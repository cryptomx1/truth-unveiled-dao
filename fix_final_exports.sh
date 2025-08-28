#!/bin/bash

# Final batch of components that need default exports
components3=(
    "client/src/components/decks/CivicEngagementDeck/TrustStreakRewardCard.tsx:TrustStreakRewardCard"
    "client/src/components/decks/CivicEngagementDeck/ReputationLadderCard.tsx:ReputationLadderCard"
    "client/src/components/decks/CivicEngagementDeck/EngagementIncentiveCard.tsx:EngagementIncentiveCard"
    "client/src/components/decks/CivicGovernanceDeck/PolicyEnforcementCard.tsx:PolicyEnforcementCard"
    "client/src/components/decks/CivicGovernanceDeck/PolicyAppealCard.tsx:PolicyAppealCard"
    "client/src/components/decks/CivicGovernanceDeck/PolicySignatureCard.tsx:PolicySignatureCard"
    "client/src/components/decks/CivicGovernanceDeck/PolicyAppealResolutionCard.tsx:PolicyAppealResolutionCard"
    "client/src/components/decks/CivicAmendmentsDeck/CommunityFeedbackCard.tsx:CommunityFeedbackCard"
    "client/src/components/decks/CivicAmendmentsDeck/ZKPVotingWindowCard.tsx:ZKPVotingWindowCard"
    "client/src/components/decks/CivicAmendmentsDeck/DAORatificationCard.tsx:DAORatificationCard"
    "client/src/components/decks/CivicJusticeDeck/EvidenceSubmissionCard.tsx:EvidenceSubmissionCard"
    "client/src/components/decks/CivicJusticeDeck/ArbitrationDecisionCard.tsx:ArbitrationDecisionCard"
    "client/src/components/decks/CivicJusticeDeck/JusticeAuditCard.tsx:JusticeAuditCard"
    "client/src/components/decks/CivicEducationDeck/ZKPLearningModuleCard.tsx:ZKPLearningModuleCard"
)

for item in "${components3[@]}"; do
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

echo "All exports fixed!"
