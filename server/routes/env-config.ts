// Server endpoint to provide environment config for client
import { Router } from 'express';

const router = Router();

// Provide environment configuration to client
router.get('/env-config', (req, res) => {
  const config = {
    PINATA_API_KEY: process.env.PINATA_API_KEY || '',
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || ''
  };
  
  res.json(config);
});

export default router;