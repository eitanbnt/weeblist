import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");
    const [simulcast, setSimulcast] = useState("");
    const [type, setType] = useState("");
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

    // Ajouter un élément
    async function addItem() {
        if (!title.trim() || !session) return;
        let dateSimulcast = new Date().toISOString().slice(0, 10);
        let typeDefaut = type;
        if (type === "") { typeDefaut = "anime"; }
        try {
            const res = await fetch("/api/collection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ title: title.trim(), type: typeDefaut, progress: 0, dateSimulcast: dateSimulcast }),
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

    // Ajouter un simulcast
    async function addSimulcast() {
        if (!title.trim()) return;
        try {
            const res = await fetch("/api/collection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    title: title.trim(), // le titre de l'anime
                    type: "simulcast",//forcer le type à simulcast
                    progress: 0,//initialisation de la progression à 0
                    dateSimulcast: simulcast,//ajout de la date de simulcast
                }),
            });
            console.log(simulcast);
            console.log(res);
            if (!res.ok) throw new Error("Erreur ajout simulcast");
            const newItem = await res.json();
            setItems((prev) => [newItem, ...prev]);
            setTitle("");
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    // Mettre à jour la progression
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

    // Mettre à jour la progression d'un simulcast (ajoute 1 et décale la date de 7 jours)
    async function updateProgressSimulcast(id, progress, date) {
        try {
            progress = progress + 1;
            let nextDate = date ? new Date(date) : null;
            if (nextDate && !isNaN(nextDate.getTime())) {
                nextDate.setDate(nextDate.getDate() + 7); // Ajoute 7 jours à la date
                date = nextDate.toISOString().slice(0, 10); // format YYYY-MM-DD
            } else {
                date = date; // fallback si la date est invalide
            }
            console.log("Mise à jour simulcast", progress, date);
            const res = await fetch(`/api/collection/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ progress: progress, dateSimulcast: date }), // Ajoute 7 jours (en ms) pour le prochain simulcast
            });
            if (!res.ok) throw new Error("Erreur mise à jour simulcast");
            const updated = await res.json();
            setItems((prev) =>
                prev.map((it) => (it.id === editingId ? updated : it))
            );
            setEditingId(null);
            setEditingTitle("");
            setItems((prev) =>
                prev.map((it) => (it.id === id ? updated : it))
            );
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    // Supprimer un élément
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

    // Filtrer, trier, rechercher
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

    // Annuler l'édition
    function cancelEdit() {
        setEditingId(null);
        setEditingTitle("");
    }

    // Sauvegarder l'édition
    async function saveEdit() {
        if (!editingTitle.trim() || !session) return;
        console.log("Sauvegarde", editingId, editingTitle, type);
        try {
            const res = await fetch(`/api/collection/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ title: editingTitle.trim(), type: type }),
            });
            if (!res.ok) throw new Error("Erreur mise à jour");
            const updated = await res.json();
            setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
            cancelEdit();
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    // Mettre à jour le type (anime, manga, simulcast, film, one-shot, tv, autre)
    async function updateType(id, newType) {
        console.log("Changement type", id, newType);
        setType(newType);
        try {
            const res = await fetch(`/api/collection/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ type: newType }),
            });
            if (!res.ok) throw new Error("Erreur mise à jour type");
            const updated = await res.json();
            console.log("Type mis à jour", updated);
            // Mettre à jour la liste en local
            setItems((prev) =>
                prev.map((it) => (it.id === id ? updated : it))
            );
            saveEdit();
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    function buttonClass(type, item) {
        if (type === "simulcast") {
            if (item.dateSimulcast > new Date().toISOString()) {
                return (
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">Prochain épisode :</span> {item.dateSimulcast ? new Date(item.dateSimulcast).toLocaleDateString() : "N/A"}
                        <button onClick={() => setEditingId(item.id)} className="bg-yellow-400 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Edit</button>
                        <button onClick={() => removeItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Suppr</button>
                    </div>
                )
            } else {
                return (
                    <div className="text-sm text-gray-500">
                        <span className="font-medium">Dernier épisode :</span> {item.dateSimulcast ? new Date(item.dateSimulcast).toLocaleDateString() : "N/A"}
                        <button onClick={() => updateProgressSimulcast(item.id, item.progress, item.dateSimulcast)} className="bg-green-500 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Vu</button>
                        <button onClick={() => setEditingId(item.id)} className="bg-yellow-400 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Edit</button>
                        <button onClick={() => removeItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Suppr</button>
                    </div>
                )
            }
        } else {
            return (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, true)} className="bg-red-500 text-white px-3 py-1 rounded-lg w-full sm:w-auto">-1</button>
                    <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, false)} className="bg-green-500 text-white px-3 py-1 rounded-lg w-full sm:w-auto">+1</button>
                    <button onClick={() => updateProgress(item.id, 0)} className="bg-blue-400 text-white px-3 py-1 rounded">Reset</button>
                    <button onClick={() => setEditingId(item.id)} className="bg-yellow-400 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Edit</button>
                    <button onClick={() => removeItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg w-full sm:w-auto">Suppr</button>
                </div>
            )
        }
    }

    if (!session) return <div className="flex items-center justify-center h-screen text-lg">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-4 sm:p-6 flex justify-center">
            <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-4 sm:p-6">
                {/* HEADER */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow">WL</div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">WeebList</h1>
                            <p className="text-sm text-gray-500">Ton tracker anime & manga ✨</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm text-gray-600">Connecté : {session.user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
                        >
                            Déconnexion
                        </button>
                    </div>
                </header>

                {/* FORMULAIRE AJOUT */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Ajouter un élément</h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded-lg p-2 w-full"
                                placeholder="Titre (ex: One Piece)"
                            />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="border rounded-lg p-2 w-full sm:w-auto"
                            >
                                <option value="anime">Anime</option>
                                <option value="manga">Manga</option>
                                <option value="simulcast">Simulcast</option>
                                <option value="film">Film</option>
                                <option value="one-shot">One-Shot</option>
                                <option value="tv">Série TV</option>
                                <option value="autre">Autre</option>
                            </select>
                            <button
                                onClick={addItem}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                        <h2 className="text-lg font-semibold mb-2">Ajouter un Simulcast</h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded-lg p-2 w-full"
                                placeholder="Titre (ex: Jujutsu Kaisen)"
                            />
                            <input
                                type="date"
                                onChange={(e) => setSimulcast(e.target.value)}
                                className="border rounded-lg p-2 w-full sm:w-auto"
                            />
                            <button
                                onClick={addSimulcast}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow w-full sm:w-auto"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </section>

                {/* RECHERCHE / TRI */}
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="border rounded-lg p-2 flex-1 w-full"
                        />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border rounded-lg p-2 w-full sm:w-auto"
                        >
                            <option value="all">Tous</option>
                            <option value="anime">Anime</option>
                            <option value="manga">Manga</option>
                            <option value="simulcast">Simulcast</option>
                            <option value="film">Film</option>
                            <option value="one-shot">One-Shot</option>
                            <option value="tv">Série TV</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label className="text-sm text-gray-600">Trier :</label>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border rounded-lg p-2 w-full sm:w-auto"
                        >
                            <option value="newest">Les plus récents</option>
                            <option value="alpha">A → Z</option>
                            <option value="progress">Par progression</option>
                        </select>
                        <button onClick={fetchItems} className="text-sm underline w-full sm:w-auto">Rafraîchir</button>
                    </div>
                </section>

                {/* LISTE */}
                <section>
                    {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{errorMsg}</div>}
                    {loading && <div className="mb-4">Chargement...</div>}

                    <ul className="space-y-3">
                        {getDisplayedItems().map(item => (
                            <li
                                key={item.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border rounded-xl p-4 shadow-sm gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    {editingId === item.id ? (
                                        <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
                                            <input
                                                value={editingTitle}
                                                onChange={(e) => setEditingTitle(e.target.value)}
                                                className="border rounded-lg p-2 flex-1 min-w-[100px]"
                                                placeholder={item.title}
                                            />
                                            <select
                                                value={item.type}
                                                onChange={(e) => updateType(item.id, e.target.value)} // on appelle une fonction dédiée
                                                className="border rounded-lg p-2 w-full sm:w-auto"
                                            >
                                                <option value="anime">Anime</option>
                                                <option value="manga">Manga</option>
                                                <option value="simulcast">Simulcast</option>
                                                <option value="film">Film</option>
                                                <option value="one-shot">One-Shot</option>
                                                <option value="tv">Série TV</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={saveEdit}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow w-full sm:w-auto"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow w-full sm:w-auto"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                                            <div className="text-sm text-gray-500">{item.type} • Progression: {item.progress ?? 0}</div>
                                        </>
                                    )}
                                </div>
                                {/* boutons actions */}
                                {buttonClass(item.type, item)}
                            </li>
                        ))}
                    </ul>
                    {getDisplayedItems().length === 0 && !loading && (
                        <div className="text-center text-sm text-gray-500 mt-6">
                            Aucun élément à afficher.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}