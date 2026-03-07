import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { requireFields } from '../middleware/validation.js';
import { generateAIResponse } from '../services/externalServices.js';
import { getBooks } from '../models/bookModel.js';
import { getFinesByStudent } from '../models/fineModel.js';
import pool from '../config/db.js';

const router = express.Router();

router.post('/ask', authMiddleware, requireFields(['query']), async (req, res) => {
    try {
        const [books, fines, faqRows] = await Promise.all([
            getBooks(),
            getFinesByStudent(req.user.id),
            pool.query('SELECT question, answer FROM library_faq ORDER BY id')
        ]);

        const faq = Array.isArray(faqRows?.[0]) ? faqRows[0] : [];
        const availableBooks = books.filter((book) => Number(book.available_quantity || 0) > 0);
        const response = await generateAIResponse(req.body.query, { availableBooks, fines, faq });
        return res.json({ success: true, data: response });
    } catch (error) {
        console.error('[AI Route] Unexpected error:', error.message);
        return res.status(500).json({ success: false, message: 'Unable to process AI request right now.' });
    }
});

export default router;