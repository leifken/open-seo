// LEIFKEN self-host addition: the landscape's desktop top bar (h-14, light,
// user menu with avatar on the right — DESIGN-SYSTEM.md §7). Upstream keeps
// its own mobile top bar; this renders on md+ only.
import { Link } from "@tanstack/react-router";
import { LogOut, RefreshCw, Settings } from "lucide-react";
import { closeDropdown } from "@/client/lib/dropdown";
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
        <div className="dropdown dropdown-end">
          <button
            type="button"
            tabIndex={0}
            className="flex items-center gap-2.5 rounded-full p-1 pr-3 transition-colors hover:bg-base-300/40"
            aria-label="Kontomenü öffnen"
          >
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-1 ring-base-300"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-content">
                {initials || "?"}
              </span>
            )}
            <span className="max-w-[16rem] truncate text-sm font-medium" data-ph-mask>
              {name}
            </span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu z-40 mt-1 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li>
              <Link to="/settings" onClick={closeDropdown}>
                <Settings className="h-4 w-4" />
                Einstellungen
              </Link>
            </li>
            <li>
              <Link to="/system" onClick={closeDropdown}>
                <RefreshCw className="h-4 w-4" />
                System & Updates
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => signOutAndRedirect()}>
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
