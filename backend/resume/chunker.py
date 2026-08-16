import re


class ResumeChunker:

    def __init__(self):

        # These are structural resume sections.
        # They are NOT candidate-specific.
        self.section_aliases = {

            "CAREER OBJECTIVE": "CAREER OBJECTIVE",
            "OBJECTIVE": "CAREER OBJECTIVE",

            "SUMMARY": "SUMMARY",
            "PROFESSIONAL SUMMARY": "SUMMARY",
            "PROFILE": "SUMMARY",

            "EDUCATION": "EDUCATION",
            "ACADEMIC QUALIFICATIONS": "EDUCATION",

            "PROJECTS": "PROJECTS",
            "PROJECT": "PROJECTS",
            "ACADEMIC PROJECTS": "PROJECTS",
            "PERSONAL PROJECTS": "PROJECTS",

            "INTERNSHIPS": "INTERNSHIPS",
            "INTERNSHIP": "INTERNSHIPS",

            "EXPERIENCE": "EXPERIENCE",
            "WORK EXPERIENCE": "EXPERIENCE",
            "PROFESSIONAL EXPERIENCE": "EXPERIENCE",

            "SKILLS": "SKILLS",
            "TECHNICAL SKILLS": "SKILLS",
            "TECHNOLOGIES": "SKILLS",

            "CERTIFICATIONS": "CERTIFICATIONS",
            "CERTIFICATES": "CERTIFICATIONS",

            "ACHIEVEMENTS": "ACHIEVEMENTS",
            "AWARDS": "ACHIEVEMENTS",

            "CO CURRICULAR": "CO-CURRICULAR",
            "CO-CURRICULAR": "CO-CURRICULAR",
            "CO CURRICULAR AND LANGUAGES": "CO-CURRICULAR",
            "CO-CURRICULAR AND LANGUAGES": "CO-CURRICULAR",

            "EXTRACURRICULAR": "EXTRACURRICULAR",

            "LANGUAGES": "LANGUAGES"
        }

    # =========================================================
    # NORMALIZE
    # =========================================================

    def normalize(self, text):

        text = text.strip()

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text

    # =========================================================
    # SECTION DETECTION
    # =========================================================

    def get_section_name(self, text):

        normalized = self.normalize(text)

        normalized = re.sub(
            r"[^A-Za-z\s\-&]",
            "",
            normalized
        )

        normalized = re.sub(
            r"\s+",
            " ",
            normalized
        ).strip().upper()

        return self.section_aliases.get(
            normalized
        )

    # =========================================================
    # ENTITY HEADING DETECTION
    # =========================================================

    def is_entity_heading(
        self,
        item,
        current_section
    ):
        """
        Detect project/internship/experience headings.

        Important:
        We do NOT check for a fixed font size.

        We mainly use:
        - section context
        - bold formatting
        - sentence characteristics
        - length
        """

        text = item["text"].strip()

        if current_section not in {
            "PROJECTS",
            "INTERNSHIPS",
            "EXPERIENCE"
        }:
            return False

        # Entity headings should normally be bold.
        if not item["bold"]:
            return False

        # Ignore URLs
        if text.startswith("http://"):
            return False

        if text.startswith("https://"):
            return False

        # Avoid treating huge text blocks as headings
        if len(text) > 120:
            return False

        # Normal descriptions generally end with a period
        if text.endswith("."):
            return False

        # Metadata labels are not entities
        if re.match(
            r"^(tech|technology|technologies|"
            r"language|languages|skills|tools|"
            r"role|duration)\s*:?\s*$",
            text,
            re.IGNORECASE
        ):
            return False

        return True

    # =========================================================
    # CREATE CHUNKS
    # =========================================================

    def create_chunks(self, extracted_items):
        """
        Convert extracted resume items into semantic chunks.
        """

        chunks = []

        current_section = None
        current_entity = None
        current_content = []

        # -----------------------------------------------------
        # Helper: save entity
        # -----------------------------------------------------

        def save_entity():

            nonlocal current_entity
            nonlocal current_content

            if current_entity is None:
                return

            text = "\n".join(
                current_content
            ).strip()

            if text:

                chunks.append({
                    "section": current_section,
                    "subsection": current_entity,
                    "text": text
                })

            current_entity = None
            current_content = []

        # -----------------------------------------------------
        # Helper: save normal section
        # -----------------------------------------------------

        def save_section():

            nonlocal current_content

            if current_section is None:
                return

            text = "\n".join(
                current_content
            ).strip()

            if text:

                chunks.append({
                    "section": current_section,
                    "subsection": None,
                    "text": text
                })

            current_content = []

        # -----------------------------------------------------
        # Process extracted items
        # -----------------------------------------------------

        for item in extracted_items:

            text = item["text"]

            # -----------------------------------------------
            # Main section
            # -----------------------------------------------

            section_name = self.get_section_name(
                text
            )

            if section_name:

                # Save previous entity
                if current_entity is not None:
                    save_entity()

                # Save previous normal section
                elif current_section is not None:
                    save_section()

                current_section = section_name
                current_content = []

                continue

            # -----------------------------------------------
            # Entity heading
            # -----------------------------------------------

            if self.is_entity_heading(
                item,
                current_section
            ):

                if current_entity is not None:
                    save_entity()

                current_entity = text
                current_content = []

                continue

            # -----------------------------------------------
            # Normal content
            # -----------------------------------------------

            if current_section is not None:

                current_content.append(text)

        # -----------------------------------------------------
        # Save remaining content
        # -----------------------------------------------------

        if current_entity is not None:

            save_entity()

        elif current_section is not None:

            save_section()

        return chunks