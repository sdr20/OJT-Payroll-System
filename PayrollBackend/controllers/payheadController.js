const PayHead = require('../models/Payhead');

const getPayheads = async (req, res) => {
  try {
    const payheads = await PayHead.find().sort({ id: 1 });
    res.status(200).json(payheads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pay heads', message: error.message });
  }
};

const createPayhead = async (req, res) => {
  try {
    const requiredFields = ['name', 'amount', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const maxIdPayhead = await PayHead.findOne().sort({ id: -1 }).select('id');
    const newId = maxIdPayhead ? maxIdPayhead.id + 1 : 1;
    const payhead = new PayHead({ ...req.body, id: newId });
    await payhead.save();
    res.status(201).json(payhead);
  } catch (error) {
    handleError(res, error, 'Failed to create pay head');
  }
};

const updatePayhead = async (req, res) => {
  try {
    const payhead = await PayHead.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payhead) {
      return res.status(404).json({ error: 'Pay head not found' });
    }
    res.status(200).json(payhead);
  } catch (error) {
    handleError(res, error, 'Failed to update pay head');
  }
};

const deletePayhead = async (req, res) => {
  try {
    const result = await PayHead.deleteOne({ id: parseInt(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Pay head not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pay head', message: error.message });
  }
};

const handleError = (res, error, defaultMessage) => {
  if (error.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation failed', message: error.message, details: error.errors });
  } else if (error.code === 11000) {
    res.status(400).json({ error: 'Duplicate ID detected', message: error.message });
  } else {
    res.status(500).json({ error: defaultMessage, message: error.message });
  }
};

module.exports = { getPayheads, createPayhead, updatePayhead, deletePayhead };