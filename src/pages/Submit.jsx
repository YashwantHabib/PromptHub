import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Toast from "../components/ui/toast";

export default function Submit() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current session user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setToast({ message: "You must be logged in to submit!", type: "error" });
      return;
    }

    if (!title.trim() || !text.trim()) {
      setToast({
        message: "Title and prompt text are required!",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // ✅ Upload image if provided
      if (image) {
        const fileExt = image.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("prompt-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("prompt-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // ✅ Insert into prompts table
      const { error: insertError } = await supabase.from("prompts").insert([
        {
          title,
          text,
          image_url: imageUrl,
          user_id: user.id,
          username: user.user_metadata?.name || user.email, // 👈 tumne bola username nahi, sirf name hai
        },
      ]);

      if (insertError) throw insertError;

      setToast({ message: "Prompt submitted successfully!", type: "success" });

      // Reset form
      setTitle("");
      setText("");
      setImage(null);
    } catch (error) {
      console.error(error.message);
      setToast({
        message: "Error submitting prompt: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Submit a Prompt</h1>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-black p-2"
        />

        <textarea
          placeholder="Write your prompt..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border border-black p-2"
          rows={5}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="border border-black p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded shadow hover:shadow-[4px_4px_0px_black] transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

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
