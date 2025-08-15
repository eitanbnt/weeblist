// This file is part of the Weeblist project.
// It handles API requests for a specific collection by ID.
import collectionController from "../../../controllers/CollectionController"; // Adjusted import path to match the new structure

export default function handler(req, res) {
  if (req.method === "GET") return collectionController.get(req, res);
  if (req.method === "PUT") return collectionController.update(req, res);
  if (req.method === "DELETE") return collectionController.remove(req, res);
  res.status(405).end();
}
