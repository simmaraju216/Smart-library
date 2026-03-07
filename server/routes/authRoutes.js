import express from 'express';
import { login, me, resetPassword, updateMe } from '../controllers/authController.js';
import { requireFields } from '../middleware/validation.js';
import { sendSMS } from '../services/externalServices.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const otpStore = new Map();

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

router.post('/login', requireFields(['email', 'password']), login);
router.post('/reset-password', requireFields(['userId', 'newPassword']), resetPassword);
router.get('/me', authMiddleware, me);
router.patch('/me', authMiddleware, updateMe);
router.post('/send-otp', requireFields(['phone']), async (req, res) => {
    const { phone } = req.body;
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(String(phone), { otp, expiresAt });

    try {
        await sendSMS(phone, `Your Smart Library OTP is ${otp}. Valid for 5 minutes.`);
    } catch (error) {
        console.error('[Auth OTP] SMS send failed:', error.message);
    }

    return res.json({ success: true, message: 'OTP generated and sent if SMS is configured.' });
});

router.post('/verify-otp', requireFields(['phone', 'otp']), (req, res) => {
    const { phone, otp } = req.body;
    const entry = otpStore.get(String(phone));

    if (!entry) {
        return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(String(phone));
        return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
    }

    if (entry.otp !== String(otp)) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    otpStore.delete(String(phone));
    return res.json({ success: true, message: 'OTP verified successfully.' });
});

export default router;