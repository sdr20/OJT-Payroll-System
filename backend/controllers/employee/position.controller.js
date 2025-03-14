import { Position } from '../../models/position.model.js';

export const getPositions = async (req, res) => {
    try {
        const positions = await Position.find();
        res.json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching positions', error: error.message });
    }
};

export const createPosition = async (req, res) => {
    try {
        const { name, salary } = req.body;
        if (!name || salary === undefined) {
            return res.status(400).json({ message: 'Position name and salary are required' });
        }

        const position = new Position({ name, salary });
        const savedPosition = await position.save();
        res.status(201).json(savedPosition);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Position name already exists' });
        } else {
            res.status(500).json({ message: 'Error creating position', error: error.message });
        }
    }
}