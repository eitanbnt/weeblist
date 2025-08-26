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

        if (!password || !confirm) {
            return setErrorMsg("Veuillez entrer et confirmer un mot de passe");
        }
        if (password !== confirm) {
            return setErrorMsg("Les mots de passe ne correspondent pas");
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            alert("Mot de passe réinitialisé avec succès !");
            router.push("/login");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Réinitialiser le mot de passe</h1>

                {errorMsg && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-3">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full border rounded p-2"
                        required
                    />
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirmer le mot de passe"
                        className="w-full border rounded p-2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                        {loading ? "Mise à jour..." : "Changer le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}
