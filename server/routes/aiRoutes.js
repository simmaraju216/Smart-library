import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireFields } from '../middleware/validation.js';
import { generateAIResponse } from '../services/externalServices.js';

const router = express.Router();

router.post('/ask', authMiddleware, requireFields(['query']), async (req, res) => {
    try {
        const response = await generateAIResponse(req.body.query);
        return res.json({ success: true, data: response });
    } catch (error) {
        console.error('[AI Route] Unexpected error:', error.message);
        return res.status(500).json({ success: false, message: 'Unable to process AI request right now.' });
    }
});

export default router;