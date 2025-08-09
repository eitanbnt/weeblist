import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('anime');
  const [loading, setLoading] = useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('collection').select('*').order('id', { ascending: false });
      if (error) {
        console.error('Supabase fetch error:', error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!title) return;
    await supabase.from('collection').insert([{ title, type, progress: 0 }]);
    setTitle('');
    fetchItems();
  }

  async function increment(id, current) {
    await supabase.from('collection').update({ progress: current + 1 }).eq('id', id);
    fetchItems();
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6">
        <header className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-pink-100 rounded flex items-center justify-center font-bold text-pink-600">WL</div>
          <h1 className="text-2xl font-semibold">WeebList</h1>
        </header>

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

        <section>
          {loading ? <div>Chargement...</div> : null}
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.type} • Progression: {item.progress}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => increment(item.id, item.progress)} className="bg-green-500 text-white px-3 py-1 rounded">+1</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
