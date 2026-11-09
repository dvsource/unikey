import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { Txt } from "../src/components/Txt";
import { font } from "../src/theme";

type Node = { type: string; props: { style?: unknown; testID?: string }; children: (Node | string)[] | null };

// The outer Text and its Sinhala spans, flattened to [fontFamily, text] runs.
function runs(node: Node): [string, string][] {
  const outer = StyleSheet.flatten(node.props.style as never) as { fontFamily: string };
  return (node.children ?? []).map((c) => {
    if (typeof c === "string") return [outer.fontFamily, c];
    const own = StyleSheet.flatten(c.props.style as never) as { fontFamily: string };
    return [own.fontFamily, (c.children ?? []).join("")];
  });
}

describe("Txt: Sinhala / Geist runs (SI-01..03)", () => {
  it("sets Sinhala in Noto Sans Sinhala and keeps numbers and Latin in Geist", async () => {
    await render(<Txt testID="t">6 N සහ 2 N</Txt>);
    const r = runs(screen.toJSON() as unknown as Node);
    expect(r).toEqual([
      [font.regular, "6 N "],
      [font.siRegular, "සහ "],
      [font.regular, "2 N"],
    ]);
  });

  it("keeps zero-width joiners inside the Sinhala run (conjuncts)", async () => {
    await render(<Txt>ප්‍රවේගය 5 m</Txt>);
    const r = runs(screen.toJSON() as unknown as Node);
    expect(r[0]).toEqual([font.siRegular, "ප්‍රවේගය "]);
    expect(r[0][1]).toContain("‍");
  });

  it("uses the medium Sinhala face for medium and semibold weights", async () => {
    await render(<Txt weight="semibold">නිව්ටන්</Txt>);
    expect(runs(screen.toJSON() as unknown as Node)[0][0]).toBe(font.siMedium);
  });

  it("gives Sinhala lines a taller line height and slightly smaller headings", async () => {
    await render(
      <>
        <Txt testID="si" size={20}>
          සම්ප්‍රයුක්ත
        </Txt>
        <Txt testID="en" size={20}>
          Resultant
        </Txt>
      </>,
    );
    expect(screen.getByTestId("si")).toHaveStyle({ fontSize: 18, lineHeight: 29 });
    expect(screen.getByTestId("en")).toHaveStyle({ fontSize: 20, lineHeight: 26 });
  });

  it("leaves pure English text as a single Geist run", async () => {
    await render(<Txt testID="t">Continue</Txt>);
    expect(screen.getByTestId("t")).toHaveStyle({ fontFamily: font.regular });
    expect(screen.getByTestId("t")).toHaveTextContent("Continue");
  });
});
