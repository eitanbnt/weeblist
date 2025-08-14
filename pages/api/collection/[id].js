import collectionController from "../../../../controllers/collectionController.js";

export default function handler(req, res) {
  if (req.method === "GET") return collectionController.get(req, res);
  if (req.method === "PUT") return collectionController.update(req, res);
  if (req.method === "DELETE") return collectionController.remove(req, res);
  res.status(405).end();
}
