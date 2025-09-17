// App.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart } from "lucide-react";
import Header from "./components/ui/header";
import Toast from "./components/ui/toast";
import PromptImage from "./components/ui/PromptImage";

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState(null);
  const [likedPrompts, setLikedPrompts] = useState([]);

  useEffect(() => {
    if (user) {
      supabase
        .from("likes")
        .select("prompt_id")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setLikedPrompts(data.map((row) => row.prompt_id));
          }
        });
    } else {
      setLikedPrompts([]);
    }
  }, [user]);

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

    const alreadyLiked = likedPrompts.includes(promptId);
    const prompt = prompts.find((p) => p.id === promptId);

    if (!prompt) return;

    if (alreadyLiked) {
      // UNLIKE
      const { error: deleteLikeError } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId);

      if (!deleteLikeError) {
        // Decrement likes using previous count
        const { error: updateError } = await supabase
          .from("prompts")
          .update({ likes: (prompt.likes || 1) - 1 })
          .eq("id", promptId);

        if (!updateError) {
          setLikedPrompts((prev) => prev.filter((id) => id !== promptId));
          setPrompts((prev) =>
            prev.map((p) =>
              p.id === promptId ? { ...p, likes: (p.likes || 1) - 1 } : p
            )
          );
        }
      }
    } else {
      // LIKE
      const { error: insertLikeError } = await supabase
        .from("likes")
        .insert([{ user_id: user.id, prompt_id: promptId }]);

      if (!insertLikeError) {
        // Increment likes using previous count
        const { error: updateError } = await supabase
          .from("prompts")
          .update({ likes: (prompt.likes || 0) + 1 })
          .eq("id", promptId);

        if (!updateError) {
          setLikedPrompts((prev) => [...prev, promptId]);
          setPrompts((prev) =>
            prev.map((p) =>
              p.id === promptId ? { ...p, likes: (p.likes || 0) + 1 } : p
            )
          );
        }
      }
    }
  };

  // Sorting logic
  const sortedPrompts = [...prompts].sort((a, b) => {
    if (sortBy === "likes") return b.likes - a.likes;
    if (sortBy === "copies") return (b.copy_count || 0) - (a.copy_count || 0);
    if (sortBy === "likedFirst") {
      return (
        (likedPrompts.includes(b.id) ? 1 : 0) -
        (likedPrompts.includes(a.id) ? 1 : 0)
      );
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
  });

  const filteredPrompts = sortedPrompts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.text.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <Header
        search={search}
        setSearch={setSearch}
        user={user}
        setUser={setUser}
      />

      {/* SORT OPTIONS */}
      <div className="max-w-7xl mx-auto px-6 py-2 mt-4 overflow-x-auto">
        <div className="flex gap-3 flex-nowrap">
          {[
            { key: "newest", label: "Newest" },
            { key: "likes", label: "Most Liked" },
            { key: "copies", label: "Most Copied" },
            { key: "likedFirst", label: "My Likes" },
          ].map((option) => (
            <button
              key={option.key}
              className={`px-4 py-1 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
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
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="rounded-lg border-2 p-0 border-black overflow-hidden bg-white hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1 group"
            >
              <PromptImage src={prompt.image_url} alt={prompt.title} />

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
                    onClick={() => handleLike(prompt.id)}
                    className="flex items-center gap-1 transition transform active:scale-125"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={likedPrompts.includes(prompt.id) ? "red" : "none"}
                      color={likedPrompts.includes(prompt.id) ? "red" : "green"}
                    />
                    {prompt.likes || 0}
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
