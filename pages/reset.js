import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Reset() {
    const [password, setPassword] = useState("");

    async function updatePassword() {
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) alert(error.message);
        else alert("Mot de passe mis à jour !");
    }

    return (
        <div className="p-6">
            <h1>Réinitialiser votre mot de passe</h1>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="border p-2 rounded"
            />
            <button onClick={updatePassword} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
                Changer
            </button>
        </div>
    );
}
