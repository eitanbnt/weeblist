import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("login"); // "login" ou "signup"
    const router = useRouter();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    async function handleLogin(e) {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) setErrorMsg(error.message);
        else router.push("/");
    }

    async function handleSignup(e) {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);

        if (error) {
            if (error.message.includes("already registered")) {
                setErrorMsg("Un compte existe déjà avec cet email !");
            } else {
                setErrorMsg(error.message);
            }
        } else {
            alert("Compte créé ! Vérifiez vos emails pour confirmer.");
            setMode("login");
        }
    }

    async function handleResetPassword() {
        if (!email) return setErrorMsg("Veuillez entrer votre email");
        setErrorMsg("");
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/reset`,
        });

        setLoading(false);
        if (error) setErrorMsg(error.message);
        else alert("Un email de réinitialisation a été envoyé !");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">WeebList</h1>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>
                )}

                <form className="space-y-3" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border rounded-lg p-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full border rounded-lg p-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow"
                        >
                            {loading ? "Connexion..." : "Connexion"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignup}
                            disabled={loading}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow"
                        >
                            Inscription
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={handleResetPassword}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Mot de passe oublié ?
                    </button>
                </div>
            </div>
        </div>
    );
}