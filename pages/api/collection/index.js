// This file is part of the Weeblist project.
// It handles API requests for the collection list and creation.
import collectionController from "../../../controllers/CollectionController";// Adjusted import path to match the new structure

export default function handler(req, res) {
    if (req.method === "GET") return collectionController.list(req, res);
    if (req.method === "POST") return collectionController.create(req, res);
    res.status(405).end(); // Méthode non autorisée
}
// Pour les méthodes PUT et DELETE, elles sont gérées dans [id].js
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from("collection")
  .insert([{ title, type, progress: 0, user_id: user.id }])
  .select();