import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

export default function FileDropzone({ onFile, accept = ".pdf,.docx,.txt", fileName, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      if (files && files[0]) onFile(files[0]);
    },
    [onFile]
  );

  if (fileName) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <FileText size={16} className="text-signal-600" />
          <span className="truncate max-w-xs">{fileName}</span>
        </div>
        {onClear && (
          <button onClick={onClear} className="text-ink-400 hover:text-ink-700" aria-label="Remove file">
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors
        ${dragOver ? "border-signal-400 bg-signal-50" : "border-ink-200 bg-ink-50/60 hover:border-signal-300"}`}
    >
      <UploadCloud size={22} className="text-signal-500" />
      <p className="text-sm font-medium text-ink-700">Drop your resume here, or click to browse</p>
      <p className="text-xs text-ink-400">PDF, DOCX, or TXT</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
