export default function SortOptions({ sortBy, setSortBy }) {
  const options = [
    { key: "newest", label: "Newest" },
    { key: "likes", label: "Most Liked" },
    { key: "copies", label: "Most Copied" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 mt-4">
      {options.map((option) => (
        <button
          key={option.key}
          className={`px-4 py-1 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
            sortBy === option.key
              ? "bg-black text-white shadow-lg"
              : "bg-white text-black border border-black hover:shadow-[6px_6px_0px_black] hover:-translate-y-1"
          }`}
          onClick={() => setSortBy(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
