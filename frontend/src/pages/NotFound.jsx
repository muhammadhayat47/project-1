import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-center px-6">
      <p className="font-display text-6xl font-semibold text-signal-600">404</p>
      <p className="text-ink-500">That page doesn't exist.</p>
      <Link to="/">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  );
}
