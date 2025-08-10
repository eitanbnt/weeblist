// pages/index.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("anime");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest"); // newest, alpha, progress
  const [filter, setFilter] = useState("all"); // all, anime, manga
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // --- Auth handling (Supabase v2 style) ---
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // subscribe to auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          listener?.subscription?.unsubscribe?.();
        };
      } catch (e) {
        console.error("Auth init error:", e);
      }
    }
    initAuth();
  }, []);

  // --- Fetch with debug & RLS hint ---
  async function fetchItems() {
    setLoading(true);
    setErrorMsg("");
    try {
      // Basic select
      const resp = await supabase.from("collection").select("*");
      // Debug logs for investigation
      console.log("Supabase select response:", resp);
      if (resp.error) {
        // If RLS blocks, Supabase returns an error or data empty depending on policy
        setErrorMsg(
          `Erreur Supabase: ${resp.error.message}. Si tu as RLS activé sur la table 'collection', ajoute une policy publique de SELECT ou adapte la requête en fonction de l'authentification.`
        );
        setItems([]);
      } else {
        if (!resp.data || resp.data.length === 0) {
          // No rows found — could be empty table OR RLS blocking results
          setErrorMsg(
            "Aucun élément trouvé. Vérifie que la table `collection` contient des données ET que Row Level Security (RLS) n'empêche pas la lecture publique."
          );
        } else {
          setErrorMsg("");
        }
        setItems(resp.data || []);
      }
    } catch (e) {
      console.error("Erreur fetchItems:", e);
      setErrorMsg("Erreur réseau ou exception JS — regarde la console pour plus de détails.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Add item ---
  async function addItem() {
    if (!title.trim()) return;
    try {
      const payload = { title: title.trim(), type, progress: 0 };
      const { data, error } = await supabase.from("collection").insert([payload]).select();
      if (error) {
        console.error("Insert error:", error);
        setErrorMsg("Erreur lors de l'ajout : " + error.message);
      } else {
        setTitle("");
        setType("anime");
        // ajout optimiste/refetch
        setItems((prev) => [ ...(data || []), ...prev ]);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur lors de l'ajout (exception).");
    }
  }

  // --- Increment progress ---
  async function increment(id, current) {
    try {
      const { error } = await supabase.from("collection").update({ progress: current + 1 }).eq("id", id);
      if (error) {
        console.error("Update error:", error);
        setErrorMsg("Erreur lors de la mise à jour : " + error.message);
      } else {
        // local update
        setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + 1 } : it));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur mise à jour (exception).");
    }
  }

  // --- Delete ---
  async function removeItem(id) {
    if (!confirm("Supprimer cet élément ?")) return;
    const { error } = await supabase.from("collection").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      setErrorMsg("Erreur suppression : " + error.message);
    } else {
      setItems((prev) => prev.filter(it => it.id !== id));
    }
  }

  // --- Edit ---
  function startEdit(item) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }
  async function saveEdit() {
    const id = editingId;
    if (!id) return;
    const { error } = await supabase.from("collection").update({ title: editingTitle }).eq("id", id);
    if (error) {
      console.error("Edit error:", error);
      setErrorMsg("Erreur édition : " + error.message);
    } else {
      setItems(prev => prev.map(it => it.id === id ? { ...it, title: editingTitle } : it));
      setEditingId(null);
      setEditingTitle("");
    }
  }
  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  // --- Auth actions ---
  async function signInWithEmail() {
    if (!email) return setErrorMsg("Renseigne ton email pour recevoir le lien.");
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("Sign in error:", error);
      setErrorMsg("Erreur d'authentification : " + error.message);
    } else {
      setErrorMsg("Lien envoyé à l'email (vérifie ta boîte).");
    }
  }
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // --- Derived list: search, filter, sort ---
  function getDisplayedItems() {
    let list = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(it => (it.title || "").toLowerCase().includes(q));
    }
    if (filter !== "all") list = list.filter(it => it.type === filter);
    if (sort === "newest") list.sort((a,b) => (b.id || 0) - (a.id || 0));
    if (sort === "alpha") list.sort((a,b) => (a.title || "").localeCompare(b.title || ""));
    if (sort === "progress") list.sort((a,b) => (b.progress || 0) - (a.progress || 0));
    return list;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex justify-center">
      <div className="w-full max-w-3xl">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center font-bold text-pink-600">WL</div>
            <div>
              <h1 className="text-2xl font-semibold">WeebList</h1>
              <div className="text-sm text-gray-500">Tracker anime & manga</div>
            </div>
          </div>

          <div className="text-right">
            {user ? (
              <div className="text-sm">
                <div>Connecté : <span className="font-medium">{user.email ?? user.id}</span></div>
                <button onClick={signOut} className="text-xs mt-1 underline">Se déconnecter</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email pour connexion"
                  className="border rounded px-2 py-1 text-sm"
                />
                <button onClick={signInWithEmail} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Se connecter</button>
              </div>
            )}
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
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher..." className="border rounded p-2" />
              <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="border rounded p-2">
                <option value="all">Tous</option>
                <option value="anime">Anime</option>
                <option value="manga">Manga</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Trier :</label>
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="border rounded p-2">
                <option value="newest">Les plus récents</option>
                <option value="alpha">A → Z</option>
                <option value="progress">Par progression</option>
              </select>
              <button onClick={fetchItems} className="text-sm underline">Rafraîchir</button>
            </div>
          </section>

          {/* errors / loading */}
          {errorMsg ? (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">{errorMsg}</div>
          ) : null}
          {loading ? <div className="mb-4">Chargement...</div> : null}

          {/* list */}
          <section>
            <ul className="space-y-2">
              {getDisplayedItems().map(item => (
                <li key={item.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex gap-2 items-center">
                        <input value={editingTitle} onChange={e=>setEditingTitle(e.target.value)} className="border rounded p-2 flex-1" />
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

                  <div className="flex-shrink-0 flex gap-2 ml-4">
                    <button onClick={()=>increment(item.id, item.progress ?? 0)} className="bg-green-500 text-white px-3 py-1 rounded">+1</button>
                    <button onClick={()=>startEdit(item)} className="bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={()=>removeItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">Suppr</button>
                  </div>
                </li>
              ))}
            </ul>
            {getDisplayedItems().length === 0 && !loading && (
              <div className="text-center text-sm text-gray-500 mt-4">Aucun élément à afficher.</div>
            )}
          </section>
        </main>

        <footer className="mt-4 text-xs text-gray-500">
        </footer>
      </div>
    </div>
  );
}
