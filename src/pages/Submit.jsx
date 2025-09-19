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
    const getUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // fetch the full user record from your users table
      const { data: currentUser, error } = await supabase
        .from("users")
        .select("id, name, is_owner")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error.message);
        return;
      }

      setUser(currentUser); // now includes is_owner
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

      const { error: insertError } = await supabase.from("prompts").insert([
        {
          title,
          text,
          image_url: imageUrl,
          user_id: user.id,
          username: user.name,
          is_owner: user.is_owner || false,
        },
      ]);

      if (insertError) throw insertError;

      setToast({ message: "Prompt submitted successfully!", type: "success" });
      setTitle("");
      setText("");
      setImage(null);
      navigate(-1);
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
    <div className="min-h-screen flex flex-col items-center p-4 md:p-10 bg-gradient-to-br from-purple-50 to-purple-200">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border-2 border-black bg-white  rounded-xl hover:shadow-[4px_4px_0px_black]"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
          Submit a Prompt
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white border-2 border-black rounded-xl p-6 shadow-[6px_6px_0px_black]"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-2 border-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-800"
          />

          <textarea
            placeholder="Write your prompt..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="border-2 border-black p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-800 resize-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="border-2 border-black p-2 rounded-md file:bg-pink-400 file:text-white file:border-none file:rounded-md file:px-3 file:py-1 file:cursor-pointer"
          />

          {/* Image preview */}
          {image && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-full max-h-64 object-cover border-2 border-black rounded-lg shadow-[4px_4px_0px_black]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-pink-400 border-2 border-black rounded-md font-semibold shadow-[4px_4px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

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
