// This file is part of the Weeblist project.
// It defines the WorkRepository for interacting with the work data in the database.
import { supabase } from "../lib/supabase";

// WorkRepository.js
// This repository handles all database operations related to works.
export default {
    async getAll() {
        const { data, error } = await supabase.from("work").select("*");
        if (error) throw error;
        return data;
    },

    async getById(id_work) {
        const { data, error } = await supabase
            .from("work")
            .select("*")
            .eq("id_work", id_work)
            .single();
        if (error) throw error;
        return data;
    },

    async create(work) {
        const { data, error } = await supabase.from("work").insert([work]).select();
        if (error) throw error;
        return data[0];
    },

    async update(id_work, updates) {
        const { data, error } = await supabase
            .from("work")
            .update(updates)
            .eq("id_work", id_work)
            .select();
        if (error) throw error;
        return data[0];
    },

    async delete(id_work) {
        const { error } = await supabase.from("work").delete().eq("id_work", id_work);
        if (error) throw error;
    }
};
