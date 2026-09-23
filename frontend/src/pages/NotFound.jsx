import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center">
      <Logo size={44} />
      <p className="font-display text-6xl font-semibold text-glow-300">404</p>
      <p className="text-ink-300">That page doesn't exist.</p>
      <Link to="/">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  );
}
