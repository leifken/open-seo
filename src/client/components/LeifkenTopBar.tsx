import { Link } from "@tanstack/react-router";
import { LogOut, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";

export function LeifkenTopBar() {
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name || user?.email || "";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="hidden h-14 shrink-0 items-center justify-end gap-3 px-6 md:flex">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="rounded-full"
                aria-label="Kontomenü öffnen"
              />
            }
          >
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="size-8 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {initials || "?"}
              </span>
            )}
            <span
              className="max-w-64 truncate text-sm font-medium"
              data-ph-mask
            >
              {name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem render={<Link to="/settings" />}>
              <Settings />
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link to="/system" />}>
              <RefreshCw />
              System & Updates
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOutAndRedirect()}
            >
              <LogOut />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
