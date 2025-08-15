import { useEffect, useState } from "react";

export default function Home() {
    const [items, setItems] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("anime");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    // --- Fetch all items ---
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

    // --- Add item ---
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

    // --- Update progress ---
    async function updateProgress(id, newProgress) {
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

    function incrementProgress(id, current, inc) {
        if (current >= 100) return;
        updateProgress(id, Math.min(current + inc, 100));
    }

    function decrementProgress(id, current, dec) {
        if (current <= 0) return;
        updateProgress(id, Math.max(current - dec, 0));
    }

    function resetProgress(id) {
        updateProgress(id, 0);
    }

    // --- Delete item ---
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

    // --- Edit item ---
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

    // --- Search / filter / sort ---
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
            <div className="w-full max-w-3xl">
                <header className="flex items-center justify-between mb-4">
                    <div className="w-full max-w-3xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center font-bold text-pink-600">WL</div>
                            <div>
                                <h1 className="text-2xl font-semibold">WeebList</h1>
                                <div className="text-sm text-gray-500">Tracker anime & manga</div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="bg-white rounded-2xl shadow p-5">
                    {/* add */}
                    <section className="mb-4">
                        <div className="flex gap-2 flex-wrap">
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

                    {/* search / sort / filter */}
                    <section className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-2 items-center">
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="border rounded p-2" />
                            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded p-2">
                                <option value="all">Tous</option>
                                <option value="anime">Anime</option>
                                <option value="manga">Manga</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-500">Trier :</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded p-2">
                                <option value="newest">Les plus récents</option>
                                <option value="alpha">A → Z</option>
                                <option value="progress">Par progression</option>
                            </select>
                            <button onClick={fetchItems} className="text-sm underline">Rafraîchir</button>
                        </div>
                    </section>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">{errorMsg}</div>
                    )}
                    {loading && <div className="mb-4">Chargement...</div>}

                    {/* list */}
                    <section>
                        <ul className="space-y-2">
                            {getDisplayedItems().map(item => (
                                <li key={item.id} className="flex items-center justify-between border rounded p-3">
                                    <div className="flex-1 min-w-0">
                                        {editingId === item.id ? (
                                            <div className="flex gap-2 items-center">
                                                <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="border rounded p-2 flex-1" />
                                                <button onClick={saveEdit} className="bg-blue-500 text-white px-3 py-1 rounded">Enregistrer</button>
                                                <button onClick={cancelEdit} className="px-3 py-1">Annuler</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="font-medium truncate">{item.title}</div>
                                                <div className="text-sm text-gray-500">{item.type} • Progression: {item.progress ?? 0}</div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <button onClick={() => decrementProgress(item.id, item.progress ?? 0, 1)} className="bg-red-500 text-white px-3 py-1 rounded">-1</button>
                                        <button onClick={() => incrementProgress(item.id, item.progress ?? 0, 1)} className="bg-green-500 text-white px-3 py-1 rounded">+1</button>
                                        <button onClick={() => resetProgress(item.id)} className="bg-blue-400 text-white px-3 py-1 rounded">Reset</button>
                                        <button onClick={() => startEdit(item)} className="bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                                        <button onClick={() => removeItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">Suppr</button>
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
