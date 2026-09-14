import { useEffect } from "react";

/**
 * Sets document.title while a page is mounted, restoring the previous
 * title on unmount. Keeps the browser tab / history in sync with
 * whichever CareerOS module the user is on.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · CareerOS` : "CareerOS — AI Career Intelligence";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
