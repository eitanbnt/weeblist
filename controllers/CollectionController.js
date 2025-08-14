import collectionRepository from "../repositories/CollectionRepository.js";

export default {
    async list(req, res) {
        try {
            const data = await collectionRepository.getAll();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async get(req, res) {
        try {
            const data = await collectionRepository.getById(req.query.id);
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async create(req, res) {
        try {
            const created = await collectionRepository.create(req.body);
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async update(req, res) {
        try {
            const updated = await collectionRepository.update(req.query.id, req.body);
            res.status(200).json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async remove(req, res) {
        try {
            await collectionRepository.delete(req.query.id);
            res.status(204).end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
