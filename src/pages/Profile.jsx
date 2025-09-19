import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/ui/toast";
import PromptCard from "../components/PromptCard";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "../components/ConfirmDialog";
import { Trash2 } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        fetchUserPrompts(data.user.id);
      } else {
        navigate("/login");
      }
    };
    getUser();
  }, [navigate]);

  const fetchUserPrompts = async (userId) => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setPrompts(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const handleDelete = async (id, imageUrl) => {
    // Step 1: Prompt delete
    const { error: promptError } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);

    if (promptError) {
      setToast({ message: "Failed to delete prompt", type: "error" });
      return;
    }

    // Step 2: Image delete from storage
    if (imageUrl) {
      console.log("Deleting image from storage:", imageUrl);
      try {
        // Extract path after "/prompt-images/"
        const parts = imageUrl.split("/prompt-images/");
        const path = parts[1]; // should be "userId/filename.jpg"
        console.log("Extracted path:", path);

        if (path) {
          const { error: storageError } = await supabase.storage
            .from("prompt-images")
            .remove([path]);

          if (storageError) {
            console.error("Storage delete error:", storageError);
          } else {
            console.log("Image deleted:", path);
          }
        } else {
          console.warn("Could not extract path from URL:", imageUrl);
        }
      } catch (err) {
        console.error("Error parsing image url:", err);
      }
    }

    // Step 3: Update UI
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    setToast({ message: "Prompt deleted successfully!", type: "success" });
  };

  if (!user) return null;

  const initial = user.user_metadata?.name
    ? user.user_metadata.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-400 p-6">
      {/* Top bar */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border-2 border-black bg-white  rounded-xl hover:shadow-[4px_4px_0px_black]"
        >
          ← Back
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white border-2 border-black rounded-2xl shadow-md p-6 flex flex-col items-center gap-3 mb-6 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center text-3xl font-bold">
          {initial}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {user.user_metadata?.name || "Anonymous"}
        </h2>
        <p className="text-gray-600 text-sm">{user.email}</p>
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="font-bold text-lg">{prompts.length}</p>
            <p className="text-sm text-gray-600">Prompts</p>
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={() => setConfirmLogout(true)}
          className="mt-4 border-black hover:shadow-[4px_4px_0px_black]"
        >
          Logout
        </Button>
      </div>

      {/* Prompts list */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="relative">
            <PromptCard
              prompt={prompt}
              likedPrompts={[]} // profile page pe likes ki zaroorat nahi
              handleCopy={() => {}}
              handleLike={() => {}}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setConfirmDelete({ id: prompt.id, imageUrl: prompt.image_url })
              }
              className="absolute top-2 right-2 border-black hover:shadow-[3px_3px_0px_black] p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!confirmDelete}
        title="Are you sure?"
        message="This will permanently delete your prompt."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleDelete(confirmDelete.id, confirmDelete.imageUrl);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={!!confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleLogout();
          setConfirmLogout(null);
        }}
        onCancel={() => setConfirmLogout(null)}
      />

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
