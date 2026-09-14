"""Resume parsing: turn an uploaded PDF/DOCX/TXT into plain text."""
from __future__ import annotations

import io

import pdfplumber
from docx import Document
from fastapi import HTTPException, UploadFile


async def extract_text(file: UploadFile) -> str:
    filename = (file.filename or "").lower()
    content = await file.read()

    if filename.endswith(".pdf"):
        return _extract_pdf(content)
    if filename.endswith(".docx"):
        return _extract_docx(content)
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")

    raise HTTPException(status_code=400, detail="Please upload a .pdf, .docx, or .txt resume.")


def _extract_pdf(content: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            text_parts.append(page.extract_text() or "")
    text = "\n".join(text_parts).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="Couldn't read any text from that PDF — it may be a scanned image. Try a text-based PDF or DOCX.",
        )
    return text


def _extract_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    text = "\n".join(p.text for p in doc.paragraphs).strip()
    if not text:
        raise HTTPException(status_code=422, detail="Couldn't find any text in that document.")
    return text
