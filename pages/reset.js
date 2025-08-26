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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-purple-600">Réinitialiser le mot de passe</div>
                    <p className="text-gray-500 text-sm">Entrez un nouveau mot de passe sécurisé</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">{errorMsg}</div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                    />
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirmer le mot de passe"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium shadow-md transition"
                    >
                        {loading ? "Mise à jour..." : "Changer le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}
