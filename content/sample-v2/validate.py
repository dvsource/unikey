"""Rebuild the v2 variants and teacher worksheets using the project validators."""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.dont_write_bytecode = True


def main():
    for source in sorted(ROOT.glob("*/items.json")):
        validator = ROOT.parent / "samples" / source.parent.name / "validate.py"
        spec = importlib.util.spec_from_file_location("unit_validator", validator)
        unit = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(unit)
        unit.HERE = source.parent
        # Contextual Sinhala equivalents in the revised student text.
        unit.TERM_OVERRIDES.update({
            "resultant force": "සම්ප්‍රයුක්ත බල",
            "e.m.f": "වි.ගා.බ|විද්‍යුත් ගාමක බල",
            "conducting loop": "සන්නායක පුඩු",
        })
        unit.main()


if __name__ == "__main__":
    main()
