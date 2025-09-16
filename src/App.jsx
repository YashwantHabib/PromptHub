// App.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart } from "lucide-react";
import Header from "./components/ui/header";
import Toast from "./components/ui/toast";

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  async function fetchPrompts() {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else setPrompts(data);
  }

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCopy = async (prompt) => {
    navigator.clipboard.writeText(prompt.text);
    setToast({ message: "Copied to clipboard!", type: "success" });

    const { error } = await supabase
      .from("prompts")
      .update({ copy_count: (prompt.copy_count || 0) + 1 })
      .eq("id", prompt.id);

    if (!error) {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === prompt.id ? { ...p, copy_count: (p.copy_count || 0) + 1 } : p
        )
      );
    }
  };

  const handleLike = async (promptId) => {
    if (!user) {
      setToast({ message: "Please log in to like prompts!", type: "error" });
      return;
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .single();

    if (existingLike) {
      setToast({ message: "You already liked this prompt!", type: "error" });
      return;
    }

    const { error } = await supabase
      .from("likes")
      .insert([{ user_id: user.id, prompt_id: promptId }]);

    if (!error) {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, likes: (p.likes || 0) + 1 } : p
        )
      );
      setToast({ message: "❤️", type: "success" });
    }
  };

  // Sorting logic
  const sortedPrompts = [...prompts].sort((a, b) => {
    if (sortBy === "likes") return b.likes - a.likes;
    if (sortBy === "copies") return (b.copy_count || 0) - (a.copy_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
  });

  const filteredPrompts = sortedPrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.text.toLowerCase().includes(search.toLowerCase())
  );

  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-600">
      <Header
        search={search}
        setSearch={setSearch}
        user={user}
        setUser={setUser}
      />

      {/* SORT OPTIONS */}
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 mt-4">
        {[
          { key: "newest", label: "Newest" },
          { key: "likes", label: "Most Liked" },
          { key: "copies", label: "Most Copied" },
        ].map((option) => (
          <button
            key={option.key}
            className={`px-4 py-1 rounded-full font-medium text-sm transition-all duration-200 ${
              sortBy === option.key
                ? "bg-black text-white shadow-lg "
                : "bg-white text-black border border-black hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1"
            }`}
            onClick={() => setSortBy(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="rounded-lg border-2 p-0 border-black overflow-hidden bg-white hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1 group"
            >
              <div className="relative">
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300 border-b border-black"
                />
              </div>
              <CardContent className="pb-4">
                <h2 className="font-semibold text-lg text-gray-900">
                  {prompt.title}
                </h2>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {prompt.text}
                </p>
                <div className="flex items-center justify-between mt-5 border-t border-black pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(prompt)}
                    className="flex items-center gap-2 bg-pink-400 border-black hover:shadow-[4px_4px_0px_black]"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(prompt.id, prompt.likes)}
                    className="flex items-center gap-1 transition transform active:scale-125"
                  >
                    <Heart className="w-4 h-4 text-green-500" />
                    {prompt.likes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
