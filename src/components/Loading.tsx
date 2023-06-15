import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
}