const express = require('express');
const router = express.Router();
const { restorePostgres, restoreMongo, restoreAll } = require('../services/restoreService');

router.post('/restore', async (req, res) => {
  try {
    const target = req.body.target || req.query.target || 'all';
    if (target === 'postgres') {
      await restorePostgres();
    } else if (target === 'mongodb') {
      await restoreMongo();
    } else {
      await restoreAll();
    }
    res.json({ message: `Successfully restored ${target === 'all' ? 'all databases' : `${target} data`}` });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: error.message || 'Failed to restore data' });
  }
});

module.exports = router;

