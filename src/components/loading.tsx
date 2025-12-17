import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-purple-600" />
    </div>
  )
}

