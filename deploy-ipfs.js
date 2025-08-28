import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_KEY = process.env.PINATA_API_KEY;
const SECRET_KEY = process.env.PINATA_SECRET_KEY;

console.log('🚀 Starting IPFS deployment...');
console.log('📦 API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NOT_FOUND');

if (!API_KEY || !SECRET_KEY) {
  console.error('❌ Missing Pinata credentials');
  process.exit(1);
}

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

async function deployToIPFS() {
  const distDir = './dist/public';
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found:', distDir);
    process.exit(1);
  }
  
  const files = getAllFiles(distDir);
  console.log(`📁 Found ${files.length} files to upload`);
  
  const formData = new FormData();
  
  // Add each file to form data
  files.forEach(filePath => {
    const relativePath = path.relative(distDir, filePath);
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream, {
      filepath: relativePath
    });
  });
  
  // Add metadata
  formData.append('pinataMetadata', JSON.stringify({
    name: 'truth-unveiled-civic-genome-v1.0',
    keyvalues: {
      project: 'Truth Unveiled Civic Genome',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  }));
  
  console.log('📤 Uploading to IPFS via Pinata...');
  
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': SECRET_KEY
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const cid = result.IpfsHash;
    
    console.log('✅ Upload successful!');
    console.log(`📍 CID: ${cid}`);
    console.log(`🌐 Pinata Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log(`🌐 IPFS Gateway: https://ipfs.io/ipfs/${cid}`);
    
    // Create deployment log
    const deploymentLog = {
      timestamp: new Date().toISOString(),
      cid: cid,
      size: result.PinSize,
      fileCount: files.length,
      gateways: {
        pinata: `https://gateway.pinata.cloud/ipfs/${cid}`,
        ipfs: `https://ipfs.io/ipfs/${cid}`,
        cloudflare: `https://cf-ipfs.com/ipfs/${cid}`
      }
    };
    
    fs.writeFileSync('deployment-result.json', JSON.stringify(deploymentLog, null, 2));
    
    // Create markdown log
    const markdownLog = `# IPFS Deployment - Truth Unveiled Civic Genome

## Deployment Details
- **CID**: \`${cid}\`
- **Timestamp**: ${new Date().toISOString()}
- **File Count**: ${files.length}
- **Size**: ${result.PinSize} bytes

## Access URLs
- **Pinata**: https://gateway.pinata.cloud/ipfs/${cid}
- **IPFS.io**: https://ipfs.io/ipfs/${cid} 
- **Cloudflare**: https://cf-ipfs.com/ipfs/${cid}

## Key Routes
- \`${cid}/command\` - Civic Command Center
- \`${cid}/deck/1\` - WalletOverviewDeck  
- \`${cid}/vault/analyzer\` - Vault Analytics
- \`${cid}/genesis-fuse\` - Genesis Fusion Loop
- \`${cid}/press/wave\` - Press Wave Dashboard

Generated: ${new Date().toISOString()}
`;
    
    fs.writeFileSync('IPFS_DEPLOYMENT_LOG.md', markdownLog);
    
    console.log('📝 Deployment logs created');
    console.log('🎉 IPFS deployment complete!');
    
    return deploymentLog;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Execute deployment
deployToIPFS();