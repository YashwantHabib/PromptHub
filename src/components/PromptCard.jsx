import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Heart } from "lucide-react";
import PromptImage from "./ui/PromptImage";

export default function PromptCard({
  prompt,
  likedPrompts,
  handleCopy,
  handleLike,
}) {
  return (
    <Card className="rounded-lg border-2 p-0 border-black overflow-hidden bg-white hover:shadow-[6px_6px_0px_black] transition duration-300 hover:-translate-y-1 group">
      <PromptImage src={prompt.image_url} alt={prompt.title} />

      <CardContent className="pb-4">
        <h2 className="font-semibold text-lg text-gray-900">{prompt.title}</h2>
        <p className="text-sm text-gray-700 mt-1">
          by <span className="font-medium">@{prompt.username}</span>
        </p>

        <div className="flex items-center justify-between mt-5 border-t border-black pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(prompt)}
            className="flex items-center gap-2 bg-pink-400 border-black hover:shadow-[4px_4px_0px_black]"
          >
            <Copy className="w-4 h-4" /> Copy
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleLike(prompt.id)}
            className="flex items-center gap-1 transition transform active:scale-125"
          >
            <Heart
              className="w-4 h-4"
              fill={likedPrompts.includes(prompt.id) ? "red" : "none"}
              color={likedPrompts.includes(prompt.id) ? "red" : "green"}
            />
            {prompt.likes || 0}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
