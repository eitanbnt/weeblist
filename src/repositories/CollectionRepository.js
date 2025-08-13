import { supabase } from "../../lib/supabase";

export default {
    async getAll() {
        const { data, error } = await supabase.from("collection").select("*");
        if (error) throw error;
        return data;
    },
    async getById(id) {
        const { data, error } = await supabase.from("collection").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
    },
    async create(collection) {
        const { data, error } = await supabase.from("collection").insert([collection]).select();
        if (error) throw error;
        return data[0];
    },
    async update(id, updates) {
        const { data, error } = await supabase.from("collection").update(updates).eq("id", id).select();
        if (error) throw error;
        return data[0];
    },
    async delete(id) {
        const { error } = await supabase.from("collection").delete().eq("id", id);
        if (error) throw error;
    }
};
