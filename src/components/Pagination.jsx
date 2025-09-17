export default function Pagination({ page, setPage, total, limit }) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap font-mono">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => p - 1)}
        className={`px-4 py-2 border-2 border-black rounded-md shadow-[3px_3px_0px_black] transition-all ${
          page === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-white hover:-translate-y-1 active:translate-y-0 active:shadow-none"
        }`}
      >
        ← Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
        <button
          key={pg}
          onClick={() => setPage(pg)}
          className={`w-10 h-10 border-2 border-black rounded-md shadow-[3px_3px_0px_black] font-bold transition-all duration-200 ${
            page === pg
              ? "bg-black text-white"
              : "bg-white hover:bg-yellow-200 hover:-translate-y-1 active:translate-y-0 active:shadow-none"
          }`}
        >
          {pg}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => setPage((p) => p + 1)}
        className={`px-4 py-2 border-2 border-black rounded-md shadow-[3px_3px_0px_black] transition-all ${
          page === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-white hover:-translate-y-1 active:translate-y-0 active:shadow-none"
        }`}
      >
        Next →
      </button>
    </div>
  );
}
