import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart, Sparkles, Search, X } from "lucide-react";

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);

  async function seedData() {
    const dummyPrompts = [
      {
        title: "3D Figurine",
        text: "Using the nano-banana model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the brush modeling process of this figurine. Next to the computer screen is a BANDAl-style toy packaging box printed with the original artwork., The packaging features two-dimensional flat illustrations. Please turn this photo into a figure. Behind it, there should be a Model packaging box with the character from this photo printed on it. In front of the box on a round plastic base place the figure version of the photo I gave you. I’d like the PVC material to be clearly represented. It would be even better if the background is indoors.",
        image_url:
          "https://vbxqqugnwptppwmhlpoz.supabase.co/storage/v1/object/sign/prompt-images/Virat3dFigurine.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZjhjMzM1Ny0xOTQ1LTRjOTYtOGZjOS1lNGNiMDNhZjVmMGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9tcHQtaW1hZ2VzL1ZpcmF0M2RGaWd1cmluZS5wbmciLCJpYXQiOjE3NTc5NDAzMTMsImV4cCI6MTc4OTQ3NjMxM30.yyXLz1APKv20vIhufViwM8Vl-n3cpzY81sgekB5-dXo",
      },
      {
        title: "Retro Saree",
        text: "Convert, 4k HD realistic, A stunning portrait of a young Indian woman with long, dark, wavy hair cascading over her shoulders. She is wearing a translucent, elegant red saree draped over one shoulder, revealing a fitted blouse underneath. White flowers are tucked behind her right ear. She is looking slightly to her right, with a soft, serene expression. I want same face as I uploaded no alternation 100 percent same. The background is a plain, warm-toned wall, illuminated by a warm light source from the right, creating a distinct, soft-edged shadow of her profile and hair on the wall behind her. The overall mood is retro and artistic.",
        image_url:
          "https://vbxqqugnwptppwmhlpoz.supabase.co/storage/v1/object/sign/prompt-images/RetroSaree.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZjhjMzM1Ny0xOTQ1LTRjOTYtOGZjOS1lNGNiMDNhZjVmMGEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9tcHQtaW1hZ2VzL1JldHJvU2FyZWUuanBnIiwiaWF0IjoxNzU3OTQwNjc2LCJleHAiOjE3ODk0NzY2NzZ9.VXt_ptdcucGye3MliWpYF-3Vou1d9Hr9j55yIadgzI4",
      },
    ];

    const { error } = await supabase.from("prompts").insert(dummyPrompts);
    if (error) console.error("Insert error:", error);
    else console.log("Dummy data inserted ✅");
  }

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setToast("Copied to clipboard!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleLike = async (id, currentLikes) => {
    // Update in Supabase
    const { error } = await supabase
      .from("prompts")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);

    if (error) {
      console.error("Error updating likes:", error.message);
      return;
    }

    // Update in local state
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" /> PromptHub
          </h1>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-2 py-1 text-sm rounded-md border focus:outline-none focus:ring focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Mobile Search Icon */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileSearch(true)}
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-30">
          <div className="bg-white dark:bg-gray-900 shadow-lg w-full max-w-md mt-20 mx-4 rounded-lg flex items-center gap-2 p-3">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-2 py-1 text-sm rounded-md outline-none bg-transparent dark:text-gray-100"
            />
            <button onClick={() => setMobileSearch(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="rounded-2xl overflow-hidden shadow-md bg-white/90 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group py-0"
            >
              <div className="relative">
                <img
                  src={prompt.image_url}
                  alt={prompt.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
              <CardContent className="pb-5">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                  {prompt.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {prompt.text}
                </p>
                <div className="flex items-center justify-between mt-5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(prompt.text)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLike(prompt.id, prompt.likes)}
                    className="flex items-center gap-1 transition transform active:scale-125"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    {prompt.likes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
