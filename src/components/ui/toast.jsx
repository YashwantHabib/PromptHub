import { useState, useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg border-2 border-black z-50
        ${type === "success" ? "bg-green-300" : "bg-red-300"}`}
    >
      <p className="font-semibold">{message}</p>
    </div>
  );
}
