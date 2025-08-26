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

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            router.push("/");
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            if (error.message.includes("already registered")) {
                setErrorMsg("Un compte existe déjà avec cet email !");
            } else {
                setErrorMsg(error.message);
            }
        } else {
            alert("Compte créé ! Vérifiez vos emails pour confirmer votre inscription.");
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

        if (error) {
            setErrorMsg(error.message);
        } else {
            alert("Un email de réinitialisation a été envoyé !");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">
                    {mode === "login" ? "Connexion" : "Créer un compte"}
                </h1>

                {errorMsg && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 rounded">
                        {errorMsg}
                    </div>
                )}

                <form
                    onSubmit={mode === "login" ? handleLogin : handleSignup}
                    className="space-y-3"
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full border rounded p-2"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full border rounded p-2"
                        required={mode === "signup" || mode === "login"}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                        {loading
                            ? "Chargement..."
                            : mode === "login"
                                ? "Se connecter"
                                : "Créer un compte"}
                    </button>
                </form>

                {mode === "login" ? (
                    <div className="mt-4 text-sm text-center">
                        Pas encore de compte ?{" "}
                        <button
                            onClick={() => setMode("signup")}
                            className="text-blue-600 underline"
                        >
                            Créer un compte
                        </button>
                        <br />
                        <button
                            onClick={handleResetPassword}
                            className="mt-2 text-blue-600 underline"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 text-sm text-center">
                        Déjà un compte ?{" "}
                        <button
                            onClick={() => setMode("login")}
                            className="text-blue-600 underline"
                        >
                            Se connecter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
