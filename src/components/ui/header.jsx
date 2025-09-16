import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Header({ search, setSearch }) {
  return (
    <header className="border-b border-black bg-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1
            className="text-4xl font-bold tracking-tight text-black"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Promptify
          </h1>

          {/* Mobile Button */}
          <Button
            variant="outline"
            className="border-black text-black md:hidden hover:shadow-[4px_4px_0px_black] transition duration-200"
          >
            Log in
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 w-full md:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
            <Input
              type="text"
              placeholder="Search prompts..."
              value={search} // 👈 controlled
              onChange={(e) => setSearch(e.target.value)} // 👈 update App.tsx state
              className="pl-10 border-black text-black placeholder-gray-700 bg-white focus:outline-none focus-visible:ring-0 focus:border-black focus:shadow-[4px_4px_0px_black]"
            />
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            className="border-black text-black hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1"
          >
            Log in
          </Button>
        </div>
      </div>
    </header>
  );
}
