/**
 * IPFS Upload Script for Truth Unveiled Civic Genome v1.0
 * 
 * Uploads production build to IPFS via Pinata API and returns valid CID
 * Authority: Commander Mark via JASMY Relay System
 * Purpose: Fix corrupted CID "QmXj5llhfmbendtruthunveiled" with valid deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.error('❌ IPFS Upload Failed: Missing Pinata credentials');
  process.exit(1);
}

async function uploadDirectoryToPinata(directoryPath) {
  try {
    console.log('📦 Preparing Truth Unveiled v1.0 for IPFS upload...');
    
    const form = new FormData();
    
    // Recursively add all files from the dist/public directory
    function addFilesToForm(dirPath, basePath = '') {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const relativePath = path.join(basePath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          addFilesToForm(filePath, relativePath);
        } else {
          form.append('file', fs.createReadStream(filePath), {
            filepath: relativePath.replace(/\\/g, '/') // Ensure Unix-style paths
          });
        }
      });
    }
    
    // Add all files from dist/public (the built frontend)
    const publicDir = path.join(directoryPath, 'public');
    if (fs.existsSync(publicDir)) {
      addFilesToForm(publicDir);
      console.log('📁 Added frontend build files from dist/public');
    } else {
      console.error('❌ Build directory not found: dist/public');
      process.exit(1);
    }
    
    // Pinata metadata for the upload
    const metadata = JSON.stringify({
      name: 'Truth Unveiled Civic Genome v1.0',
      description: 'Decentralized civic engagement platform with 20+ modular UI/UX card layouts and 80+ modules. Features DAO functionality, tier-weighted voting, anonymous communication, civic engagement tools, DID management, verifiable voting with ZKP privacy, real-time trust heatmaps, and TruthCoins smart contract integration.',
      keyvalues: {
        version: '1.0.0',
        platform: 'Truth Unveiled',
        type: 'Production Build',
        authority: 'Commander Mark',
        deployment: 'IPFS',
        timestamp: new Date().toISOString()
      }
    });
    
    form.append('pinataMetadata', metadata);
    
    // Pin options for long-term availability
    const options = JSON.stringify({
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          { id: 'FRA1', desiredReplicationCount: 2 },
          { id: 'NYC1', desiredReplicationCount: 2 }
        ]
      }
    });
    
    form.append('pinataOptions', options);
    
    console.log('🚀 Uploading to IPFS via Pinata...');
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
        ...form.getHeaders()
      },
      body: form
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ IPFS Upload Successful!');
    console.log(`📌 CID: ${result.IpfsHash}`);
    console.log(`📏 Size: ${result.PinSize} bytes`);
    console.log(`⏰ Timestamp: ${result.Timestamp}`);
    
    // Verify the upload by testing gateway access
    console.log('\n🔍 Verifying gateway access...');
    const gateways = [
      `https://ipfs.io/ipfs/${result.IpfsHash}`,
      `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      `https://${result.IpfsHash}.ipfs.dweb.link`
    ];
    
    for (const gateway of gateways) {
      try {
        const testResponse = await fetch(gateway, { method: 'HEAD', timeout: 5000 });
        console.log(`✅ ${gateway} - Status: ${testResponse.status}`);
      } catch (error) {
        console.log(`❌ ${gateway} - Error: ${error.message}`);
      }
    }
    
    console.log('\n📡 RELAY CONFIRMATION:');
    console.log('✅ Re-upload Complete');
    console.log(`CID: ${result.IpfsHash}`);
    console.log('\n🔗 Access URLs:');
    gateways.forEach(url => console.log(`   ${url}`));
    
    return result.IpfsHash;
    
  } catch (error) {
    console.error('❌ IPFS Upload Error:', error.message);
    process.exit(1);
  }
}

// Execute upload
const buildDir = path.join(__dirname, '..', 'dist');
uploadDirectoryToPinata(buildDir)
  .then(cid => {
    console.log(`\n🎯 MISSION COMPLETE: CID ${cid} ready for GROK QA Cycle A`);
  })
  .catch(error => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });