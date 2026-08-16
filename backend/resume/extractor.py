import re
from pathlib import Path

import pymupdf
from docx import Document


class ResumeExtractor:

    def extract(self, file_path):
        """
        Extract structured resume content from PDF or DOCX.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"Resume not found: {file_path}"
            )

        extension = path.suffix.lower()

        if extension == ".pdf":
            return self._extract_pdf(path)

        elif extension == ".docx":
            return self._extract_docx(path)

        else:
            raise ValueError(
                "Unsupported file format. Use PDF or DOCX."
            )

    # =========================================================
    # PDF EXTRACTION
    # =========================================================

    def _extract_pdf(self, path):
        """
        Extract text together with layout information.

        We keep:
        - page
        - position
        - font size
        - font
        - bold information

        We do NOT depend on a particular font size.
        """

        document = pymupdf.open(path)

        items = []

        for page_number, page in enumerate(document):

            blocks = page.get_text("dict")["blocks"]

            for block in blocks:

                if "lines" not in block:
                    continue

                for line in block["lines"]:

                    spans = line["spans"]

                    if not spans:
                        continue

                    text_parts = []
                    font_sizes = []

                    bold = False

                    for span in spans:

                        text = span["text"].strip()

                        if text:
                            text_parts.append(text)

                        font_sizes.append(
                            span["size"]
                        )

                        # Detect bold using PDF font flags
                        if span["flags"] & 16:
                            bold = True

                        # Also check font name
                        if "bold" in span["font"].lower():
                            bold = True

                    text = " ".join(text_parts)

                    text = self._clean_text(text)

                    if not text:
                        continue

                    bbox = line["bbox"]

                    items.append({
                        "page": page_number + 1,
                        "text": text,
                        "x": bbox[0],
                        "y": bbox[1],
                        "font_size": max(font_sizes),
                        "bold": bold
                    })

        document.close()

        # Sort according to visual position
        items.sort(
            key=lambda item: (
                item["page"],
                item["y"],
                item["x"]
            )
        )

        return items

    # =========================================================
    # DOCX EXTRACTION
    # =========================================================

    def _extract_docx(self, path):
        """
        Extract DOCX paragraphs.

        DOCX does not provide exactly the same layout
        information as our PDF extraction, so we return
        a simpler structure.
        """

        document = Document(path)

        items = []

        for paragraph in document.paragraphs:

            text = paragraph.text.strip()

            if not text:
                continue

            bold = False

            for run in paragraph.runs:

                if run.bold:
                    bold = True
                    break

            items.append({
                "page": 1,
                "text": self._clean_text(text),
                "x": 0,
                "y": len(items),
                "font_size": 0,
                "bold": bold
            })

        return items

    # =========================================================
    # TEXT CLEANING
    # =========================================================

    def _clean_text(self, text):

        text = text.strip()

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text