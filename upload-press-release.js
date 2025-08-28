import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import crypto from 'crypto';

const API_KEY = process.env.PINATA_API_KEY;
const SECRET_KEY = process.env.PINATA_SECRET_KEY;

async function uploadPressRelease() {
  console.log('📡 UPLOADING PRESS RELEASE TO IPFS VIA PINATA...');
  
  const filePath = './client/public/press-release-v1.0.md';
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileSize = Buffer.byteLength(fileContent, 'utf8');
  
  console.log('📄 File loaded:', fileSize, 'bytes');
  
  const formData = new FormData();
  formData.append('file', fileContent, {
    filename: 'press-release-v1.0.md',
    contentType: 'text/markdown'
  });
  
  formData.append('pinataMetadata', JSON.stringify({
    name: 'truth-unveiled-press-release-v1.0',
    keyvalues: {
      project: 'Truth Unveiled Civic Genome',
      version: '1.0',
      type: 'press-release',
      timestamp: new Date().toISOString()
    }
  }));
  
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': SECRET_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log('');
    console.log('✅ IPFS UPLOAD SUCCESSFUL!');
    console.log('📍 Valid CID:', cid);
    console.log('📦 Size:', result.PinSize, 'bytes');
    console.log('🔗 Format: CIDv1 Base32,', cid.length, 'characters');
    
    // Calculate SHA-256 hash
    const sha256 = crypto.createHash('sha256').update(fileContent).digest('hex');
    
    console.log('');
    console.log('🌐 GATEWAY URLS:');
    console.log('Pinata:', `https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log('IPFS.io:', `https://ipfs.io/ipfs/${cid}`);
    console.log('DWEB:', `https://${cid}.ipfs.dweb.link`);
    console.log('Mirror:', `https://dweb.link/ipfs/${cid}`);
    
    // Save deployment result
    const deploymentResult = {
      cid: cid,
      timestamp: new Date().toISOString(),
      gateway: `https://gateway.pinata.cloud/ipfs/${cid}`,
      ipfs: `https://ipfs.io/ipfs/${cid}`,
      dweb: `https://${cid}.ipfs.dweb.link`,
      mirror: `https://dweb.link/ipfs/${cid}`,
      status: 'deployed',
      version: '1.0',
      size: result.PinSize,
      sha256: sha256
    };
    
    fs.writeFileSync('./deployment-result.json', JSON.stringify(deploymentResult, null, 2));
    
    console.log('');
    console.log('📋 DEPLOYMENT SUMMARY:');
    console.log('CID:', cid);
    console.log('SHA-256:', sha256.substring(0, 32) + '...');
    console.log('Status: DEPLOYED & PINNED');
    
    return deploymentResult;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    throw error;
  }
}

uploadPressRelease().catch(console.error);