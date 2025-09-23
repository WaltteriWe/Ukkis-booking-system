import { cn } from "@/lib/utils";

export default function Footer(className?: string) {
  {/* <footer className="border-t pt-4 font-bold"> */}
  return (
<footer className={cn("border-t pt-4 font-bold", className)}>
          <p className="text-center text-sm text-gray-500" >
            &copy; {new Date().getFullYear()} Ukkis Safaris. All rights reserved.
          </p>
        </footer>
    );
}