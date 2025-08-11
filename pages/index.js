// pages/index.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  // initilisation des états
  const [items, setItems] = useState([]);// Initial empty state
  const [title, setTitle] = useState("");// Input for new item title
  const [type, setType] = useState("Anime");// Default type for new items
  const [loading, setLoading] = useState(false);// Loading state for fetch operations
  const [errorMsg, setErrorMsg] = useState("");// Error message state
  const [email, setEmail] = useState("");// Email for auth
  const [user, setUser] = useState(null);// Authenticated user state
  const [query, setQuery] = useState("");// Search query state
  const [sort, setSort] = useState("newest"); // Sorting options: newest, alpha, progress
  const [filter, setFilter] = useState("all"); // Filter options: all, anime, manga
  const [editingId, setEditingId] = useState(null);// ID of the item being edited
  const [editingTitle, setEditingTitle] = useState("");// Title of the item being edited

  // --- Initialize auth state ---
  //TO DO: Réparer l'authentification car elle ne fonctionne pas
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session },// Get current session
        } = await supabase.auth.getSession();// Fetch session data
        setUser(session?.user ?? null);// Set user state based on session

        // Listen for auth state changes
        // This will update the user state when login/logout occurs
        // Note: This listener is automatically cleaned up by Supabase
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          listener?.subscription?.unsubscribe?.();// Clean up listener on component unmount
        };
      } catch (e) {
        console.error("Auth init error:", e);
      }
    }
    initAuth();
  }, []);

  // --- Fetch items from Supabase ---
  async function fetchItems() {
    setLoading(true);
    setErrorMsg("");
    try {
      // Basic select
      const resp = await supabase.from("collection").select("*");
      // Debug logs for investigation
      console.log("Supabase select response:", resp);
      if (resp.error) {
        console.error("Fetch error:", resp.error);
        setErrorMsg("Erreur lors de la récupération des éléments : " + resp.error.message);
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

  // Fetch items on initial load
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Add item ---
  //TO DO: Ajouter un bouton pour ajouter un item
  //TO DO: Ajouter un bouton pour ajouter un item avec un lien vers MyAnimeList ou AniList
  //TO DO: Ajouter un bouton pour ajouter un item avec une recherche automatique
  //TO DO: Faire un blocage pour empêcher l'ajout d'un item avec un titre vide
  //TO DO: Faire un blocage pour empêcher l'ajout d'un item avec un titre déjà existant
  //TO DO: Faire un blocage pour empêcher l'ajout d'un item avec un type invalide
  //TO DO: Faire un blocage pour empêcher l'ajout d'un item avec une progression négative
  //TO DO: Faire un blocage pour empêcher l'ajout d'un item avec une progression supérieure à 100
  async function addItem() {
    if (!title.trim()) return;
    try {
      const payload = { title: title.trim(), type, progress: 0 };// Prepare payload for insertion
      const { data, error } = await supabase.from("collection").insert([payload]).select();// Insert new item and return the inserted row
      if (error) {
        console.error("Insert error:", error);
        setErrorMsg("Erreur lors de l'ajout : " + error.message);
      } else {
        setTitle("");
        setType("anime");
        // ajout optimiste/refetch
        setItems((prev) => [...(data || []), ...prev]);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur lors de l'ajout (exception).");
    }
  }

  // --- Increment progress ---
  async function incrementProgress(id, current, increment) {
    if (!id) return;  // Validate ID
    if (current >= 100) {
      setErrorMsg("Progression déjà à 100% !");
      return;  // Prevent increment if already at max
    }
    const newProgress = Math.min(current + increment, 100);  // Ensure we don't exceed 100
    try {
      const { error } = await supabase.from("collection").update({ progress: newProgress }).eq("id", id);// Update progress in the database
      if (error) {
        console.error("Update error:", error);
        setErrorMsg("Erreur lors de la mise à jour : " + error.message);
      }
      else {
        // Optimistically update local state
        setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: newProgress } : it));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Erreur mise à jour (exception).");
    }
  }
  async function increment1(id, current) {
    if (!id) return;
    if (current >= 100) {
      setErrorMsg("Progression déjà à 100% !");
      return;
    } else {
      try {
        const { error } = await supabase.from("collection").update({ progress: current + 1 }).eq("id", id);// Increment progress by 1
        if (error) {
          console.error("Update error:", error);
          setErrorMsg("Erreur lors de la mise à jour : " + error.message);
        } else {
          // local update
          setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + 1 } : it));// Optimistically update the local state
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Erreur mise à jour (exception).");
      }
    }
  }

  async function increment10(id, current) {
    if (!id) return;
    if (current >= 100) {
      setErrorMsg("Progression déjà à 100% !");
      return;
    } else if (current + 10 > 100) {
      const ajout = 100 - current;// Calculate how much to add to reach 100
      try {
        const { error } = await supabase.from("collection").update({ progress: current + ajout }).eq("id", id);// Increment progress by 1
        if (error) {
          console.error("Update error:", error);
          setErrorMsg("Erreur lors de la mise à jour : " + error.message);
        } else {
          // local update
          setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + ajout } : it));// Optimistically update the local state
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Erreur mise à jour (exception).");
      }
    } else {
      try {
        const { error } = await supabase.from("collection").update({ progress: current + 10 }).eq("id", id);// Increment progress by 1
        if (error) {
          console.error("Update error:", error);
          setErrorMsg("Erreur lors de la mise à jour : " + error.message);
        } else {
          // local update
          setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + 10 } : it));// Optimistically update the local state
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Erreur mise à jour (exception).");
      }
    }
  }

  async function increment100(id, current) {
    if (!id) return;
    if (current >= 100) {
      setErrorMsg("Progression déjà à 100% !");
      return;
    } else if (current + 10 > 100) {
      const ajout = 100 - current;// Calculate how much to add to reach 100
      try {
        const { error } = await supabase.from("collection").update({ progress: current + ajout }).eq("id", id);// Increment progress by 1
        if (error) {
          console.error("Update error:", error);
          setErrorMsg("Erreur lors de la mise à jour : " + error.message);
        } else {
          // local update
          setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + ajout } : it));// Optimistically update the local state
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Erreur mise à jour (exception).");
      }
    } else {
      try {
        const { error } = await supabase.from("collection").update({ progress: current + 100 }).eq("id", id);// Increment progress by 1
        if (error) {
          console.error("Update error:", error);
          setErrorMsg("Erreur lors de la mise à jour : " + error.message);
        } else {
          // local update
          setItems((prev) => prev.map(it => it.id === id ? { ...it, progress: it.progress + 100 } : it));// Optimistically update the local state
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Erreur mise à jour (exception).");
      }
    }
  }

  // --- Delete ---
  async function removeItem(id) {
    if (!confirm("Supprimer cet élément ?")) return;
    const { error } = await supabase.from("collection").delete().eq("id", id);// Delete item by ID
    if (error) {
      console.error("Delete error:", error);
      setErrorMsg("Erreur suppression : " + error.message);
    } else {
      setItems((prev) => prev.filter(it => it.id !== id));// Optimistically remove item from local state
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
  //TO DO: Ajouter un bouton pour se connecter avec Google
  //TO DO : a revoir l'authentification car elle ne fonctionne pas
  async function signInWithEmail() {
    if (!email) return setErrorMsg("Renseigne ton email pour recevoir le lien.");// Validate email input
    const { data, error } = await supabase.auth.signInWithOtp({ email });// Sign in with email OTP
    if (error) {
      console.error("Sign in error:", error);
      setErrorMsg("Erreur d'authentification : " + error.message);
    } else {
      setErrorMsg("Lien envoyé à l'email (vérifie ta boîte).");
    }
  }

  // Sign out function
  //TO DO: Ajouter un bouton pour se déconnecter
  //TO DO: Ajouter un bouton pour supprimer le compte
  //TO DO: Ajouter un bouton pour changer l'email
  //TO DO: Ajouter un bouton pour changer le mot de passe
  //TO DO: Ajouter un bouton pour changer le pseudo
  //TO DO: Ajouter un bouton pour changer la photo de profil
  //TO DO: Ajouter un bouton pour changer le thème
  async function signOut() {
    await supabase.auth.signOut();// Sign out from Supabase
    setUser(null);
  }

  // --- Derived list: search, filter, sort ---
  // TO DO: Ajouter un bouton pour réinitialiser la recherche, le filtre et le tri
  // TO DO: Ajouter un bouton pour réinitialiser la liste
  // TO DO: Ajouter un bouton pour exporter la liste en CSV
  // TO DO: Ajouter un bouton pour importer une liste depuis un fichier CSV
  // TO DO: Ajouter un bouton pour partager la liste avec d'autres utilisateurs
  // TO DO: Ajouter un bouton pour synchroniser la liste avec une API externe (ex: MyAnimeList, AniList, etc.)
  // TO DO: Ajouter un bouton pour exporter la liste en JSON
  // TO DO: Ajouter un bouton pour importer une liste depuis un fichier JSON
  // TO DO: Mofier le filtre car défaut pour afficher "Anime" et "Manga"
  function getDisplayedItems() {
    let list = [...items];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(it => (it.title || "").toLowerCase().includes(q));
    }
    if (filter !== "all") list = list.filter(it => it.type === filter);// Filter by type (anime/manga)
    if (sort === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0));// Sort by newest first (by ID)
    if (sort === "alpha") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));// Sort alphabetically by title
    if (sort === "progress") list.sort((a, b) => (b.progress || 0) - (a.progress || 0));// Sort by progress (highest first)
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
                {/* Email input for login */}
                {/* TO DO: Ajouter un bouton pour se connecter avec Google */}
                {/* TO DO: Refaire la connexion car pas bon du tout */}
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
                        <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} className="border rounded p-2 flex-1" />
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
                    <button onClick={() => increment1(item.id, item.progress ?? 0)} className="bg-green-500 text-white px-3 py-1 rounded">+1</button>
                    <button onClick={() => increment10(item.id, item.progress ?? 0)} className="bg-green-500 text-white px-3 py-1 rounded">+10</button>
                    <button onClick={() => increment100(item.id, item.progress ?? 0)} className="bg-green-500 text-white px-3 py-1 rounded">+100</button>
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

        <footer className="mt-4 text-xs text-gray-500">
        </footer>
      </div>
    </div>
  );
}
