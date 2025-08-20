// pages/api/collection/[id].js
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  const { id } = req.query;

  // Auth check
  const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace("Bearer ", ""));
  if (userError || !user) return res.status(401).json({ error: "Non autorisé" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("collection")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) return res.status(404).json({ error: "Introuvable" });
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const updates = req.body;

    const { data, error } = await supabase
      .from("collection")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await supabase
      .from("collection")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).end();
}
