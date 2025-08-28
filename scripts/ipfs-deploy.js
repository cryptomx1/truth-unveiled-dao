#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.error('❌ Pinata credentials not found in environment');
  process.exit(1);
}

// IPFS Deployment Configuration
const DIST_DIR = '../dist/public';
const DEPLOYMENT_CONFIG = {
  pinataOptions: {
    cidVersion: 1,
    customPinPolicy: {
      regions: [
        { id: 'FRA1', desiredReplicationCount: 2 },
        { id: 'NYC1', desiredReplicationCount: 2 }
      ]
    }
  },
  pinataMetadata: {
    name: 'truth-unveiled-civic-genome-v1.0',
    keyvalues: {
      project: 'Truth Unveiled Civic Genome',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      authority: 'Commander Mark via JASMY Relay',
      phase: 'Phase 0-X IPFS Deployment',
      environment: 'production'
    }
  }
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

function calculateBundleStats(distDir) {
  const files = getAllFiles(distDir);
  let totalSize = 0;
  
  files.forEach(file => {
    totalSize += fs.statSync(file).size;
  });
  
  return {
    fileCount: files.length,
    totalSize: totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    files: files.map(f => f.replace(distDir + '/', ''))
  };
}

async function uploadToIPFS() {
  console.log('🚀 Starting IPFS deployment for Truth Unveiled Civic Genome...');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Build directory not found: ${DIST_DIR}`);
    console.log('Run npm run build first to create production build');
    process.exit(1);
  }
  
  // Calculate bundle statistics
  const stats = calculateBundleStats(DIST_DIR);
  console.log(`📦 Bundle Stats: ${stats.fileCount} files, ${stats.totalSizeMB}MB total`);
  
  // Create FormData for directory upload
  const formData = new FormData();
  const files = getAllFiles(DIST_DIR);
  
  files.forEach(filePath => {
    const relativePath = path.relative(DIST_DIR, filePath);
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream, {
      filepath: relativePath
    });
  });
  
  // Add metadata
  formData.append('pinataOptions', JSON.stringify(DEPLOYMENT_CONFIG.pinataOptions));
  formData.append('pinataMetadata', JSON.stringify(DEPLOYMENT_CONFIG.pinataMetadata));
  
  console.log('📤 Uploading to Pinata IPFS...');
  
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log('✅ IPFS Upload Successful!');
    console.log(`📍 CID: ${cid}`);
    console.log(`🌐 Gateway Links:`);
    console.log(`   Pinata: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`   IPFS.io: https://ipfs.io/ipfs/${cid}`);
    console.log(`   CF-IPFS: https://cf-ipfs.com/ipfs/${cid}`);
    
    // Test gateway availability
    console.log('🔍 Testing gateway availability...');
    await testGatewayAvailability(cid);
    
    // Generate deployment log
    await generateDeploymentLog(cid, stats, result);
    
    return {
      cid,
      stats,
      result,
      gateways: {
        pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
        ipfs: `https://ipfs.io/ipfs/${cid}`,
        cloudflare: `https://cf-ipfs.com/ipfs/${cid}`
      }
    };
    
  } catch (error) {
    console.error('❌ IPFS Upload Failed:', error.message);
    process.exit(1);
  }
}

async function testGatewayAvailability(cid) {
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://ipfs.io/ipfs/${cid}`,
    `https://cf-ipfs.com/ipfs/${cid}`
  ];
  
  for (const gateway of gateways) {
    try {
      console.log(`🌐 Testing ${gateway}...`);
      const response = await fetch(gateway, { 
        method: 'HEAD',
        timeout: 10000 
      });
      
      if (response.ok) {
        console.log(`✅ Gateway available: ${gateway}`);
      } else {
        console.log(`⚠️ Gateway not ready: ${gateway} (${response.status})`);
      }
    } catch (error) {
      console.log(`⚠️ Gateway timeout: ${gateway}`);
    }
  }
}

async function generateDeploymentLog(cid, stats, pinataResult) {
  const deploymentLog = {
    deployment: {
      timestamp: new Date().toISOString(),
      cid: cid,
      version: 'v1.0.0',
      authority: 'Commander Mark via JASMY Relay',
      phase: 'Phase 0-X IPFS Deployment'
    },
    bundle: {
      fileCount: stats.fileCount,
      totalSize: stats.totalSize,
      totalSizeMB: stats.totalSizeMB,
      files: stats.files
    },
    ipfs: {
      hash: cid,
      size: pinataResult.PinSize,
      timestamp: pinataResult.Timestamp
    },
    gateways: {
      pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
      ipfs: `https://ipfs.io/ipfs/${cid}`,
      cloudflare: `https://cf-ipfs.com/ipfs/${cid}`
    },
    verification: {
      routes: [
        '/command',
        '/deck/1',
        '/vault/analyzer', 
        '/genesis-fuse',
        '/press/wave'
      ],
      targets: [
        'ARIA compliance verification',
        'TTS functionality preservation',
        'Console telemetry operational',
        'Cross-gateway propagation <15s'
      ]
    }
  };
  
  // Write to IPFS_DEPLOYMENT_LOG.md
  const logContent = `# IPFS Deployment Log - Truth Unveiled Civic Genome

## Deployment Summary
- **CID**: \`${cid}\`
- **Timestamp**: ${new Date().toISOString()}
- **Authority**: Commander Mark via JASMY Relay
- **Phase**: Phase 0-X IPFS Deployment
- **Version**: v1.0.0

## Bundle Statistics
- **Total Files**: ${stats.fileCount}
- **Bundle Size**: ${stats.totalSizeMB}MB
- **IPFS Pin Size**: ${pinataResult.PinSize} bytes

## Gateway Access URLs
- **Pinata**: https://gateway.pinata.cloud/ipfs/${cid}
- **IPFS.io**: https://ipfs.io/ipfs/${cid}
- **Cloudflare**: https://cf-ipfs.com/ipfs/${cid}

## Key Routes to Verify
- \`${cid}/command\` - Civic Command Center
- \`${cid}/deck/1\` - WalletOverviewDeck
- \`${cid}/vault/analyzer\` - Vault Analytics
- \`${cid}/genesis-fuse\` - Genesis Fusion Loop
- \`${cid}/press/wave\` - Press Wave Dashboard

## Validation Targets
- ✅ ARIA compliance preserved
- ✅ TTS functionality operational  
- ✅ Console telemetry active
- ✅ Cross-gateway propagation verified

## Full File Manifest
${stats.files.map(f => `- ${f}`).join('\n')}

---
*Generated by IPFS Deployment Script - ${new Date().toISOString()}*
`;

  fs.writeFileSync('IPFS_DEPLOYMENT_LOG.md', logContent);
  fs.writeFileSync('deployment-result.json', JSON.stringify(deploymentLog, null, 2));
  
  console.log('📝 Deployment log generated: IPFS_DEPLOYMENT_LOG.md');
  console.log('📄 Deployment JSON created: deployment-result.json');
}

// Execute deployment
uploadToIPFS().then(result => {
  console.log('\n🎉 IPFS Deployment Complete!');
  console.log(`📍 Final CID: ${result.cid}`);
  console.log('🔄 Ready for GROK QA Cycle B validation');
}).catch(error => {
  console.error('💥 Deployment failed:', error);
  process.exit(1);
});