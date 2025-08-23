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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErrorMsg(error.message);
        else router.push("/");
        setLoading(false);
    }

    async function handleSignup(e) {
        e.preventDefault();
        setErrorMsg("");
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            if (error.message.includes("already registered")) {
                setErrorMsg("Un compte existe déjà avec cet email !");
            } else {
                setErrorMsg(error.message);
            }
        } else {
            alert("Compte créé ! Vérifiez vos emails pour valider.");
        }
    }

    async function handleResetPassword() {
        if (!email) return alert("Veuillez entrer votre email");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://weeblist.vercel.app/reset", // ✅ production
        });
        if (error) alert(error.message);
        else alert("Email de réinitialisation envoyé !");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow p-6 rounded-lg w-80 space-y-4"
            >
                <h1 className="text-xl font-semibold text-center">Se connecter</h1>
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full border rounded p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Mot de passe oublié ?
                </button>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white rounded py-2"
                    disabled={loading}
                >
                    {loading ? "..." : "Connexion"}
                </button>
                <button
                    onClick={handleSignup}
                    className="w-full bg-gray-200 rounded py-2 text-sm"
                    disabled={loading}
                >
                    Créer un compte
                </button>
            </form>
        </div>
    );
}
