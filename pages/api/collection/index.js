import collectionController from "../../../controllers/CollectionController";// Adjusted import path to match the new structure

export default function handler(req, res) {
    if (req.method === "GET") return collectionController.list(req, res);
    if (req.method === "POST") return collectionController.create(req, res);
    res.status(405).end(); // Méthode non autorisée
}
// Pour les méthodes PUT et DELETE, elles sont gérées dans [id].js