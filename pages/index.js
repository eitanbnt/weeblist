import { useEffect, useState } from "react";

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

    async function fetchItems() {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/collection");
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
        fetchItems();
    }, []);

    async function addItem() {
        if (!title.trim()) return;
        try {
            const res = await fetch("/api/collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                body: JSON.stringify({ title: title.trim(), type: "simulcast", progress: 0, dateSimulcast: simulcast }),
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ progress: newProgress }),
            });
            if (!res.ok) throw new Error("Erreur mise à jour");
            const updated = await res.json();
            setItems((prev) =>
                prev.map((it) => (it.id === id ? updated : it))
            );
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    async function removeItem(id) {
        if (!confirm("Supprimer cet élément ?")) return;
        try {
            const res = await fetch(`/api/collection/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erreur suppression");
            setItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    function startEdit(item) {
        setEditingId(item.id);
        setEditingTitle(item.title);
    }

    async function saveEdit() {
        try {
            const res = await fetch(`/api/collection/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editingTitle }),
            });
            if (!res.ok) throw new Error("Erreur édition");
            const updated = await res.json();
            setItems((prev) =>
                prev.map((it) => (it.id === editingId ? updated : it))
            );
            setEditingId(null);
            setEditingTitle("");
        } catch (err) {
            setErrorMsg(err.message);
        }
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingTitle("");
    }

    function getDisplayedItems() {
        let list = [...items];
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter((it) =>
                (it.title || "").toLowerCase().includes(q)
            );
        }
        if (filter !== "all") list = list.filter((it) => it.type === filter);
        if (sort === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0));
        if (sort === "alpha") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        if (sort === "progress") list.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        return list;
    }

    return (
        <div className="min-h-screen p-4 bg-gray-50 flex justify-center">
            <div className="w-full max-w-4xl">
                {/* header */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center font-bold text-pink-600">WL</div>
                        <div>
                            <h1 className="text-2xl font-semibold">WeebList</h1>
                            <div className="text-sm text-gray-500">Tracker anime & manga</div>
                        </div>
                    </div>
                </header>

                {/* main */}
                <main className="bg-white rounded-2xl shadow p-5">
                    {/* add */}
                    <section className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded p-2 min-w-[150px]"
                                placeholder="Titre (ex: One Piece)"
                            />
                            <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded p-2">
                                <option value="anime">Anime</option>
                                <option value="manga">Manga</option>
                            </select>
                            <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
                        </div>
                    </section>

                    {/* add Simulcast */}
                    <section className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <h4 className="text-lg font-semibold">Ajouter un Simulcast : </h4>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 border rounded p-2 min-w-[150px]"
                                placeholder="Titre (ex: One Piece)"
                            />
                            <input
                                type="date"
                                onChange={(e) => setSimulcast(e.target.value)}
                                className="border rounded p-2 min-w-[150px]"
                                placeholder="Date de sortie"
                            />
                            <button onClick={addSimulcast} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
                        </div>
                    </section>

                    {/* search / filter / sort */}
                    <section className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="border rounded p-2 flex-1" />
                            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded p-2">
                                <option value="all">Tous</option>
                                <option value="anime">Anime</option>
                                <option value="manga">Manga</option>
                                <option value="simulcast">Simulcast</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="text-sm text-gray-500">Trier :</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded p-2">
                                <option value="newest">Les plus récents</option>
                                <option value="alpha">A → Z</option>
                                <option value="progress">Par progression</option>
                            </select>
                            <button onClick={fetchItems} className="text-sm underline">Rafraîchir</button>
                        </div>
                    </section>

                    {/* erreurs et loading */}
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">{errorMsg}</div>
                    )}
                    {loading && <div className="mb-4">Chargement...</div>}

                    {/* liste */}
                    <section>
                        <ul className="space-y-3">
                            {getDisplayedItems().map(item => (
                                <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border rounded p-3 gap-3">
                                    <div className="flex-1 min-w-0">
                                        {editingId === item.id ? (
                                            <div className="flex flex-col sm:flex-row gap-2 items-center">
                                                <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="border rounded p-2 flex-1 min-w-[100px]" />
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="bg-blue-500 text-white px-3 py-1 rounded">Enregistrer</button>
                                                    <button onClick={cancelEdit} className="px-3 py-1">Annuler</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="font-medium truncate">{item.title}</div>
                                                <div className="text-sm text-gray-500">{item.type} • Progression: {item.progress ?? 0}</div>
                                                {item.type === "simulcast" && item.dateSimulcast && (
                                                    <div className="text-sm text-gray-500">Sortie du dernier épisode : {new Date(item.dateSimulcast).toLocaleDateString()}</div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* boutons actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, true)} className="bg-red-500 text-white px-3 py-1 rounded">-1</button>
                                        <button onClick={() => updateProgress(item.id, item.progress ?? 0, 1, false)} className="bg-green-500 text-white px-3 py-1 rounded">+1</button>
                                        <button onClick={() => updateProgress(item.id, 0)} className="bg-blue-400 text-white px-3 py-1 rounded">Reset</button>
                                        <button onClick={() => startEdit(item)} className="bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                                        <button onClick={() => removeItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded">Suppr</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {getDisplayedItems().length === 0 && !loading && (
                            <div className="text-center text-sm text-gray-500 mt-4">Aucun élément à afficher.</div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
