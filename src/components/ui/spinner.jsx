import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

function Spinner({ className, ...props }) {
  return (
    <div className="flex items-center justify-center" {...props}>
      <Loader2 className={cn("h-8 w-8 animate-spin text-primary", className)} />
    </div>
  );
}

export { Spinner };
