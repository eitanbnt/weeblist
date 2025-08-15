// This file is part of the Weeblist project.
// It defines the CollectionWorkRepository for interacting with the collection_work data in the database.
import { supabase } from "../lib/supabase";

// CollectionWorkRepository.js
// This repository handles all database operations related to collection_work.
export default {
    async getAll() {
        const { data, error } = await supabase.from("collection_work").select("*");
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("collection_work")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(link) {
        const { data, error } = await supabase.from("collection_work").insert([link]).select();
        if (error) throw error;
        return data[0];
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from("collection_work")
            .update(updates)
            .eq("id", id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await supabase.from("collection_work").delete().eq("id", id);
        if (error) throw error;
    }
};
