const express = require('express');
const router = express.Router();
const PayHead = require('../models/PayHead');

router.get('/', async (req, res) => {
  try {
    const payHeads = await PayHead.find();
    res.json(payHeads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pay heads' });
  }
});

router.post('/', async (req, res) => {
  try {
    const maxId = await PayHead.findOne().sort({ id: -1 });
    const newId = maxId ? maxId.id + 1 : 1;
    const payHead = new PayHead({ ...req.body, id: newId });
    await payHead.save();
    res.status(201).json(payHead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pay head' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payHead = await PayHead.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!payHead) return res.status(404).json({ error: 'Pay head not found' });
    res.json(payHead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pay head' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await PayHead.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Pay head not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pay head' });
  }
});

module.exports = router;