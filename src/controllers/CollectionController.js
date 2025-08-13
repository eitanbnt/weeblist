import CollectionRepository from "../repositories/CollectionRepository.js";

export default {
    async list(req, res) {
        try {
            const collections = await CollectionRepository.getAll();
            res.json(collections);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async get(req, res) {
        try {
            const collection = await CollectionRepository.getById(req.params.id);
            res.json(collection);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async create(req, res) {
        try {
            const newCollection = await CollectionRepository.create(req.body);
            res.status(201).json(newCollection);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        try {
            await CollectionRepository.update(req.params.id, req.body);
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            await CollectionRepository.delete(req.params.id);
            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
