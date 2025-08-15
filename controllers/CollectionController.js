import collectionRepository from "../repositories/CollectionRepository.js";// Import the collection repository

export default {
    // Controller for handling collection-related requests
    /**
     * List all collections
    **/
    async list(req, res) {
        try {
            const data = await collectionRepository.getAll();
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    /**
     * Get a specific collection by ID
     * @param {Object} req - The request object containing the collection ID in query parameters
     * @param {Object} res - The response object to send the result
    **/
    async get(req, res) {
        try {
            const data = await collectionRepository.getById(req.query.id);
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    /**
     * Create a new collection
     * @param {Object} req - The request object containing the collection data in the body
     * @param {Object} res - The response object to send the created collection
    **/
    async create(req, res) {
        try {
            const created = await collectionRepository.create(req.body);
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    /**
     * Update an existing collection
     * @param {Object} req - The request object containing the collection ID in query parameters and updated data in the body
     * @param {Object} res - The response object to send the updated collection
    **/
    async update(req, res) {
        try {
            const updated = await collectionRepository.update(req.query.id, req.body);
            res.status(200).json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    /**
     * Remove a collection by ID
     * @param {Object} req - The request object containing the collection ID in query parameters
     * @param {Object} res - The response object to send a success status
    **/
    async remove(req, res) {
        try {
            await collectionRepository.delete(req.query.id);
            res.status(204).end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
