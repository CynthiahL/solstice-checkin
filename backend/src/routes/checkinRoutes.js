import express from 'express';
import { processScan } from '../controller/checkinController.js';

const router = express.Router();

// This route processes the scan from the Kiosk view interface layer
router.post('/scan', processScan);

export default router;
