import { Router } from 'express';
import { adminDb } from '../config/firebase-admin';

export const moderationRouter = Router();

moderationRouter.post('/report', async (req, res) => {
    const { targetId, targetType, reason, reporterId } = req.body;

    if (!targetId || !targetType || !reporterId) {
        return res.status(400).json({ error: 'Missing reporting parameters' });
    }

    try {
        const collection = targetType === 'USER' ? 'users' : 'community_posts';
        const docRef = adminDb.collection(collection).doc(targetId);
        
        // Transaction to increment report count and check thresholds
        await adminDb.runTransaction(async (t) => {
            const doc = await t.get(docRef);
            if (!doc.exists) return;

            const currentData = doc.data() || {};
            const newReportsCount = (currentData.reportsCount || 0) + 1;
            const updates: any = { reportsCount: newReportsCount };

            if (targetType === 'USER' && newReportsCount >= 3) {
                updates.isFlagged = true;
            } else if (targetType === 'POST' && newReportsCount >= 5) {
                updates.isHidden = true;
            }

            t.update(docRef, updates);

            // Log the report
            const reportRef = adminDb.collection('reports').doc();
            t.set(reportRef, {
                targetId,
                targetType,
                reason,
                reporterId,
                createdAt: new Date().toISOString()
            });
        });

        res.json({ success: true, message: 'Report processed' });
    } catch (e) {
        console.error('Moderation Error:', e);
        res.status(500).json({ error: 'Failed to process report' });
    }
});
