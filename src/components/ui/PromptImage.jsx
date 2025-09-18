import { useState } from "react";

export default function PromptImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageSrc =
    !src || error
      ? "https://vbxqqugnwptppwmhlpoz.supabase.co/storage/v1/object/public/prompt-images/Placeholder1.png"
      : src;

  return (
    <div className="relative w-full h-52 bg-gray-200">
      {/* Skeleton pulse until loaded */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)} // fallback to placeholder on error
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
