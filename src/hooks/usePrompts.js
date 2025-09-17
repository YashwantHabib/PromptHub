import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function usePrompts(search, page, limit, sortBy) {
  const [prompts, setPrompts] = useState([]);
  const [total, setTotal] = useState(0);

  async function fetchPrompts() {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("prompts")
      .select("*", { count: "exact" })
      .range(from, to);

    if (sortBy === "likes") query = query.order("likes", { ascending: false });
    else if (sortBy === "copies")
      query = query.order("copy_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,text.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (!error) {
      setPrompts(data);
      setTotal(count);
    }
  }

  useEffect(() => {
    fetchPrompts();
  }, [search, page, sortBy]);

  return { prompts, total, setPrompts };
}
