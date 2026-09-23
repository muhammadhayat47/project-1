import { useNavigate } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LiveClock from "../ui/LiveClock";

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-ink-900/50 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10 md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-white sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <LiveClock className="hidden text-xs text-ink-300 sm:block" />
        {user ? (
          <>
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-ink-200 sm:flex">
              <User size={14} />
              {user.full_name}
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-300 hover:bg-white/10 hover:text-white sm:px-3"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </>
        ) : (
          <span className="rounded-full border border-glow-400/30 bg-glow-400/10 px-2.5 py-1 text-xs font-medium text-glow-300 sm:px-3">
            Demo mode
          </span>
        )}
      </div>
    </header>
  );
}
