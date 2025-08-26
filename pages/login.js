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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
            <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-pink-600">WeebList</div>
                    <p className="text-gray-500 text-sm">
                        {mode === "login" ? "Connectez-vous pour accéder à votre collection" : "Créez votre compte pour commencer"}
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">{errorMsg}</div>
                )}

                <form
                    onSubmit={mode === "login" ? handleLogin : handleSignup}
                    className="space-y-4"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-medium shadow-md transition"
                    >
                        {loading
                            ? "Chargement..."
                            : mode === "login"
                                ? "Se connecter"
                                : "Créer un compte"}
                    </button>
                </form>

                {mode === "login" ? (
                    <div className="mt-6 text-sm text-center text-gray-600">
                        <button
                            onClick={() => setMode("signup")}
                            className="text-pink-600 font-medium hover:underline"
                        >
                            Créer un compte
                        </button>{" "}
                        ·{" "}
                        <button
                            onClick={handleResetPassword}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 text-sm text-center text-gray-600">
                        <button
                            onClick={() => setMode("login")}
                            className="text-pink-600 font-medium hover:underline"
                        >
                            Déjà un compte ? Se connecter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
