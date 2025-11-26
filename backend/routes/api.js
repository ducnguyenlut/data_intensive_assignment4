const express = require('express');
const router = express.Router();
const dbService = require('../services/databaseService');

// Get all entities (from both databases separately and combined)
router.get('/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const { view } = req.query; // 'all', 'postgres', 'mongodb', 'combined'
    
    const results = await dbService.getAllEntities(entityType);
    
    if (view === 'postgres') {
      return res.json({ data: results.postgres, source: 'PostgreSQL' });
    } else if (view === 'mongodb') {
      return res.json({ data: results.mongodb, source: 'MongoDB' });
    } else if (view === 'combined' && results.combined.length > 0) {
      return res.json({ data: results.combined, source: 'Combined' });
    } else {
      return res.json(results);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join similar entities from both databases
router.get('/:entityType/join', async (req, res) => {
  try {
    const { entityType } = req.params;
    const results = await dbService.joinEntities(entityType);
    res.json({ data: results, source: 'Joined from both databases' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Insert entity (automatically routes to appropriate database)
router.post('/:entityType', async (req, res) => {
  try {
    const { entityType } = req.params;
    const data = req.body;
    const result = await dbService.insertEntity(entityType, data);
    res.status(201).json({ 
      message: `${entityType} created successfully`,
      data: result 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update entity (automatically routes to appropriate database)
router.put('/:entityType/:id', async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const data = req.body;
    const result = await dbService.updateEntity(entityType, id, data);
    if (result) {
      res.json({ 
        message: `${entityType} updated successfully`,
        data: result 
      });
    } else {
      res.status(404).json({ error: `${entityType} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete entity (automatically routes to appropriate database)
router.delete('/:entityType/:id', async (req, res) => {
  try {
    const { entityType, id } = req.params;
    const { cascade, reassignTo } = req.query;
    
    const options = {};
    if (cascade === 'true' || cascade === '1') {
      options.cascade = true;
    }
    if (reassignTo !== undefined) {
      options.reassignTo = reassignTo === 'null' ? null : parseInt(reassignTo);
    }
    
    const result = await dbService.deleteEntity(entityType, id, options);
    if (result) {
      res.json({ 
        message: `${entityType} deleted successfully`,
        data: result 
      });
    } else {
      res.status(404).json({ error: `${entityType} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

