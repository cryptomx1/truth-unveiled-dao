console.log("Testing DeckWalker agent access..."); 
if (window.agentSystem) {
  const deckWalker = window.agentSystem.getAgent("deckWalker");
  if (deckWalker) {
    console.log("✅ DeckWalker agent available");
    console.log("🔍 Performing deep scan with Commander Mark specifications...");
    
    deckWalker.performDeepScan({
      depth: 5,
      allDecks: true,
      diagnostics: true,
      export: {
        json: "deckwalk-log.json",
        markdown: "deckwalk-summary.md"
      },
      options: {
        traceFailedRoutes: true,
        validateComponents: true,
        cidGateCheck: true,
        crossDeckSync: true
      }
    }).then(summary => {
      console.log("✅ Deep scan completed successfully");
      console.log("📊 Scan Summary:", summary);
      console.log("📄 Results exported to localStorage keys: deckwalk-log, deckwalk-summary");
    }).catch(error => {
      console.error("❌ Deep scan failed:", error);
    });
  } else {
    console.error("❌ DeckWalker agent not found in agent system");
  }
} else {
  console.error("❌ Agent system not available");
}
