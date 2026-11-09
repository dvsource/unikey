"""Validate the Current Electricity skill graph and its question map. Checks are listed in ../graphkit.py.

Run: python3 content/skills/current-electricity/validate.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import graphkit  # noqa: E402

SAMPLE = os.path.join(HERE, "..", "..", "samples", "current-electricity-20", "items.json")

if __name__ == "__main__":
    sys.exit(graphkit.validate(HERE, "phy.elec", SAMPLE))
