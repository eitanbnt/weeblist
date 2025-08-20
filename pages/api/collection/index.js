// pages/api/collection/index.js
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
    if (req.method === "GET") {
        // Récupération de l’utilisateur connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace("Bearer ", ""));
        if (userError || !user) return res.status(401).json({ error: "Non autorisé" });

        // Sélectionner uniquement ses items
        const { data, error } = await supabase
            .from("collection")
            .select("*")
            .eq("user_id", user.id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    if (req.method === "POST") {
        const { title, type, progress, dateSimulcast } = req.body;

        const { data: { user }, error: userError } = await supabase.auth.getUser(req.headers.authorization?.replace("Bearer ", ""));
        if (userError || !user) return res.status(401).json({ error: "Non autorisé" });

        const { data, error } = await supabase
            .from("collection")
            .insert([
                { title, type, progress, dateSimulcast, user_id: user.id }
            ])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    return res.status(405).end();
}
