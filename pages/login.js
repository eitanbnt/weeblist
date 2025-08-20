import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (error) setErrorMsg(error.message);
        else router.push("/");
    }

    async function handleSignup(e) {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        setLoading(false);
        if (error) setErrorMsg(error.message);
        else alert("Compte créé ! Vérifie tes mails.");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-semibold mb-4">Connexion WeebList</h1>
                {errorMsg && <div className="p-2 mb-3 bg-red-100 text-red-600">{errorMsg}</div>}

                <form className="space-y-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                    <button
                        onClick={handleSignup}
                        type="button"
                        className="w-full border p-2 rounded"
                    >
                        Créer un compte
                    </button>
                </form>
            </div>
        </div>
    );
}
