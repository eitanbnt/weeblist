import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Reset() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleReset(e) {
        e.preventDefault();
        setErrorMsg("");

        if (!password || !confirm) return setErrorMsg("Veuillez entrer et confirmer un mot de passe");
        if (password !== confirm) return setErrorMsg("Les mots de passe ne correspondent pas");

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) setErrorMsg(error.message);
        else {
            alert("Mot de passe réinitialisé avec succès !");
            router.push("/login");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Réinitialiser le mot de passe</h1>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>
                )}

                <form className="space-y-3" onSubmit={handleReset}>
                    <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="w-full border rounded-lg p-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        className="w-full border rounded-lg p-2"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow"
                    >
                        {loading ? "Mise à jour..." : "Changer le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}