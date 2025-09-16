import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabaseClient"; // 👈 import supabase

export default function Header({ search, setSearch, user, setUser }) {
  const initial = user?.user_metadata?.name
    ? user.user_metadata.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // 👈 user state clear
  };

  return (
    <header className="border-b border-black bg-yellow-300">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1
            className="text-4xl font-bold tracking-tight text-black"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Promptify
          </h1>

          {/* Mobile Right Side */}
          {!user ? (
            <a href="/login">
              <Button
                variant="outline"
                className="border-black text-black md:hidden hover:shadow-[4px_4px_0px_black] transition duration-200"
              >
                Log in
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout} // 👈 click karte hi logout
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border-black font-bold hover:shadow-[4px_4px_0px_black] transition duration-200"
            >
              {initial}
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 w-full md:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
            <Input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-black text-black placeholder-gray-700 bg-white focus:outline-none focus-visible:ring-0 focus:border-black focus:shadow-[4px_4px_0px_black]"
            />
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <a href="/login">
              <Button
                variant="outline"
                className="border-black text-black hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1"
              >
                Log in
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-full border-black font-bold hover:shadow-[4px_4px_0px_black] transition duration-200"
            >
              {initial}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
