#!/bin/bash

# List of components that need default exports
components=(
    "client/src/components/decks/EducationDeck/TruthLiteracyCard.tsx:TruthLiteracyCard"
    "client/src/components/decks/EducationDeck/CivicResourceCard.tsx:CivicResourceCard"
    "client/src/components/decks/EducationDeck/CommunityForumCard.tsx:CommunityForumCard"
    "client/src/components/decks/EducationDeck/CivicQuizCard.tsx:CivicQuizCard"
    "client/src/components/decks/FinanceDeck/EarningsSummaryCard.tsx:EarningsSummaryCard"
    "client/src/components/decks/FinanceDeck/TransactionHistoryCard.tsx:TransactionHistoryCard"
    "client/src/components/decks/FinanceDeck/RewardsCalculatorCard.tsx:RewardsCalculatorCard"
    "client/src/components/decks/FinanceDeck/WithdrawalInterfaceCard.tsx:WithdrawalInterfaceCard"
    "client/src/components/decks/PrivacyDeck/ZKPStatusCard.tsx:ZKPStatusCard"
    "client/src/components/decks/PrivacyDeck/SessionPrivacyCard.tsx:SessionPrivacyCard"
    "client/src/components/decks/PrivacyDeck/EncryptedMessageCard.tsx:EncryptedMessageCard"
    "client/src/components/decks/PrivacyDeck/VaultAccessCard.tsx:VaultAccessCard"
    "client/src/components/decks/CivicIdentityDeck/DIDClaimCard.tsx:DIDClaimCard"
    "client/src/components/decks/CivicIdentityDeck/BiometricProofCard.tsx:BiometricProofCard"
    "client/src/components/decks/CivicIdentityDeck/CredentialClaimCard.tsx:CredentialClaimCard"
    "client/src/components/decks/CivicIdentityDeck/IdentityLineageViewerCard.tsx:IdentityLineageViewerCard"
)

for item in "${components[@]}"; do
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
