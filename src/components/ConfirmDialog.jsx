// src/components/ui/ConfirmDialog.jsx
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-200/80 to-pink-200/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-sm w-full shadow-[6px_6px_0px_black]">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
          {title}
        </h2>
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-black hover:shadow-[3px_3px_0px_black]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 border-black hover:shadow-[3px_3px_0px_black]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
