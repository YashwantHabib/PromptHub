import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useLikes(user, prompts, setPrompts) {
  const [likedPrompts, setLikedPrompts] = useState([]);

  // fetch liked prompts
  useEffect(() => {
    if (user) {
      supabase
        .from("likes")
        .select("prompt_id")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (!error && data) setLikedPrompts(data.map((row) => row.prompt_id));
        });
    } else {
      setLikedPrompts([]);
    }
  }, [user]);

  // toggle like
  const toggleLike = async (promptId) => {
    const alreadyLiked = likedPrompts.includes(promptId);
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    if (alreadyLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId);
      await supabase
        .from("prompts")
        .update({ likes: (prompt.likes || 1) - 1 })
        .eq("id", promptId);

      setLikedPrompts((prev) => prev.filter((id) => id !== promptId));
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, likes: (p.likes || 1) - 1 } : p
        )
      );
    } else {
      await supabase
        .from("likes")
        .insert([{ user_id: user.id, prompt_id: promptId }]);
      await supabase
        .from("prompts")
        .update({ likes: (prompt.likes || 0) + 1 })
        .eq("id", promptId);

      setLikedPrompts((prev) => [...prev, promptId]);
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, likes: (p.likes || 0) + 1 } : p
        )
      );
    }
  };

  return { likedPrompts, toggleLike };
}
