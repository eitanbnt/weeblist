import collectionController from "../../../controllers/collectionController.js";

export default function handler(req, res) {
  if (req.method === "GET") return collectionController.list(req, res);
  if (req.method === "POST") return collectionController.create(req, res);
  res.status(405).end();
}
