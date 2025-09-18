import { useState } from "react";
import Header from "./components/ui/header";
import Toast from "./components/ui/toast";
import SortOptions from "./components/SortOptions";
import PromptCard from "./components/PromptCard";
import Pagination from "./components/Pagination";
import { usePrompts } from "./hooks/usePrompts";
import { useLikes } from "./hooks/useLikes";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [toast, setToast] = useState(null);

  const { user, setUser } = useAuth();
  const { prompts, total, setPrompts } = usePrompts(
    search,
    page,
    limit,
    sortBy
  );
  const { likedPrompts, toggleLike } = useLikes(
    user,
    prompts,
    setPrompts,
    setToast
  );

  const handleReport = async (prompt) => {
    const newCount = (prompt.report_count || 0) + 1;

    try {
      if (newCount >= 10) {
        // Auto delete using RPC (bypasses RLS)
        const { error: rpcError } = await supabase.rpc(
          "delete_reported_prompt",
          {
            p_prompt_id: prompt.id,
          }
        );

        if (rpcError) throw rpcError;

        setPrompts((prev) => prev.filter((p) => p.id !== prompt.id));
        setToast({
          message: "Prompt deleted due to multiple reports!",
          type: "error",
        });
      } else {
        // Just increment report_count
        const { error: updateError } = await supabase
          .from("prompts")
          .update({ report_count: newCount })
          .eq("id", prompt.id);

        if (updateError) throw updateError;

        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id ? { ...p, report_count: newCount } : p
          )
        );

        setToast({ message: "Reported successfully!", type: "success" });
      }
    } catch (error) {
      console.error("Report error:", error.message);
      setToast({
        message: "Error reporting prompt: " + error.message,
        type: "error",
      });
    }
  };

  const handleCopy = async (prompt) => {
    navigator.clipboard.writeText(prompt.text);
    setToast({ message: "Copied to clipboard!", type: "success" });

    const { error } = await supabase
      .from("prompts")
      .update({ copy_count: (prompt.copy_count || 0) + 1 })
      .eq("id", prompt.id)
      .select();

    if (error) {
      console.error("Copy count update error:", error);
      setToast({ message: "Failed to update copy count", type: "error" });
    }

    setPrompts((prev) =>
      prev.map((p) =>
        p.id === prompt.id ? { ...p, copy_count: (p.copy_count || 0) + 1 } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <Header
        search={search}
        setSearch={setSearch}
        user={user}
        setUser={setUser}
        setToast={setToast}
      />
      <SortOptions sortBy={sortBy} setSortBy={setSortBy} />

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              likedPrompts={likedPrompts}
              handleCopy={handleCopy}
              handleLike={toggleLike}
              handleReport={handleReport}
            />
          ))}
        </div>
        <Pagination page={page} setPage={setPage} total={total} limit={limit} />
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
