import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");
    const [simulcast, setSimulcast] = useState("");
    const [type, setType] = useState("anime");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [session, setSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (!session) router.push("/login");
        });

        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) router.push("/login");
            else setSession(data.session);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        setSession(null);
        router.push("/login");
    }

    async function fetchItems() {
        if (!session) return;
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/collection", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error("Erreur serveur");
            const data = await res.json();
            setItems(data);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) fetchItems();
    }, [session]);

    async function addItem() {
        if (!title.trim() || !session) return;
        try {
            const res = await fetch("/api/collection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ title: title.trim(), type, progress: 0 }),
            });
            if (!res.ok) throw new Error("Erreur ajout");
            const newItem = await res.json();
            setItems((prev) => [newItem, ...prev]);
            setTitle("");
            setType("anime");
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function addSimulcast() {
        if (!title.trim()) return;
        try {
            const res = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    type: "simulcast",
                    progress: 0,
                    dateSimulcast: simulcast,
                }),
            });
            if (!res.ok) throw new Error("Erreur ajout simulcast");
            const newItem = await res.json();
            setItems((prev) => [newItem, ...prev]);
            setTitle("");
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function updateProgress(id, current, value, type, newProgress) {
        if (!session) return;
        if (type === true) {
            if (current <= 0) return;
            newProgress = Math.max(current - value, 0);
        } else if (type === false) {
            newProgress = Math.min(current + value);
        } else {
            newProgress = 0;
        }
        try {
            const res = await fetch(`/api/collection/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ progress: newProgress }),
            });
            if (!res.ok) throw new Error("Erreur mise à jour");
            const updated = await res.json();
            setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function removeItem(id) {
        if (!session) return;
        if (!confirm("Supprimer cet élément ?")) return;
        try {
            const res = await fetch(`/api/collection/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error("Erreur suppression");
            setItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    function getDisplayedItems() {
        let list = [...items];
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((it) => (it.title || "").toLowerCase().includes(q));
        }
        if (filter !== "all") list = list.filter((it) => it.type === filter);
        if (sort === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0));
        if (sort === "alpha") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        if (sort === "progress") list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        return list;
    }

    if (!session) return <div className="flex items-center justify-center h-screen text-lg">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-6 flex justify-center">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6">
                {/* HEADER */}
                <header className="flex items-center justify-between mb-6 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow">WL</div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">WeebList</h1>
                            <p className="text-sm text-gray-500">Ton tracker anime & manga ✨</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Connecté : {session.user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
                        >
                            Déconnexion
                        </button>
                    </div>
                </header>

                {/* FORMULAIRE AJOUT */}
                <section className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Ajouter un élément</h2>
                        <div className="flex gap-2">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded-lg p-2"
                                placeholder="Titre (ex: One Piece)"
                            />
                            <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg p-2">
                                <option value="anime">Anime</option>
                                <option value="manga">Manga</option>
                            </select>
                            <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow">Ajouter</button>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Ajouter un Simulcast</h2>
                        <div className="flex gap-2">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded-lg p-2"
                                placeholder="Titre (ex: Jujutsu Kaisen)"
                            />
                            <input
                                type="date"
                                onChange={(e) => setSimulcast(e.target.value)}
                                className="border rounded-lg p-2"
                            />
                            <button onClick={addSimulcast} className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow">Ajouter</button>
                        </div>
                    </div>
                </section>

                {/* RECHERCHE / TRI */}
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div className="flex gap-2 flex-1">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="border rounded-lg p-2 flex-1"
                        />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg p-2">
                            <option value="all">Tous</option>
                            <option value="anime">Anime</option>
                            <option value="manga">Manga</option>
                            <option value="simulcast">Simulcast</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Trier :</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg p-2">
                            <option value="newest">Les plus récents</option>
                            <option value="alpha">A → Z</option>
                            <option value="progress">Par progression</option>
                        </select>
                        <button onClick={fetchItems} className="text-sm underline">Rafraîchir</button>
                    </div>
                </section>

                {/* LISTE */}
                <section>
                    {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{errorMsg}</div>}
                    {loading && <div className="mb-4">Chargement...</div>}

                    <ul className="space-y-3">
                        {getDisplayedItems().map((item) => (
                            <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border rounded-xl p-4 shadow-sm">
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                                    <div className="text-sm text-gray-500">{item.type} • Progression: {item.progress ?? 0}</div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                    <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, true)} className="bg-red-500 text-white px-3 py-1 rounded-lg">-1</button>
                                    <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, false)} className="bg-green-500 text-white px-3 py-1 rounded-lg">+1</button>
                                    <button onClick={() => removeItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg">Suppr</button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {getDisplayedItems().length === 0 && !loading && (
                        <div className="text-center text-sm text-gray-500 mt-6">Aucun élément à afficher.</div>
                    )}
                </section>
            </div>
        </div>
    );
}
