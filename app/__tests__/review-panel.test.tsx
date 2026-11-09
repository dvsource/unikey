import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReviewPanel } from "../src/components/ReviewPanel";
import { getItem } from "../src/content/pack";
import { ReviewRecord } from "../src/state/store";

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const item = getItem("phy.mech.c001")!;
const variant = item.variants[0];
const correct = variant.options.findIndex((o) => o.correct);
const wrong = variant.options.map((o, i) => (o.correct ? -1 : i)).filter((i) => i >= 0);

async function open(props: Partial<React.ComponentProps<typeof ReviewPanel>> = {}) {
  const onSave = jest.fn();
  const onClear = jest.fn();
  const onClose = jest.fn();
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ReviewPanel
        visible
        item={item}
        variant={variant}
        variantLabel={null}
        reviewerName="Test Reviewer"
        onSetReviewerName={jest.fn()}
        onSave={onSave}
        onClear={onClear}
        onClose={onClose}
        {...props}
      />
    </SafeAreaProvider>,
  );
  return { onSave, onClear, onClose };
}

describe("ReviewPanel", () => {
  it("won't save without a verdict (REV-06)", async () => {
    const { onSave } = await open();
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves several issues at once (REV-04)", async () => {
    const { onSave } = await open();
    for (const id of ["review-wrong-physics", "review-bad-sinhala", "review-other"]) await fireEvent.press(screen.getByTestId(id));
    await fireEvent.changeText(screen.getByTestId("review-note"), "  three problems  ");
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ verdict: "issues", issues: ["wrong-physics", "bad-sinhala", "other"], distractors: [], note: "three problems" }),
    );
  });

  it("makes OK and issues exclusive (REV-05)", async () => {
    const { onSave } = await open();
    await fireEvent.press(screen.getByTestId("review-ok"));
    await fireEvent.press(screen.getByTestId("review-bad-sinhala"));
    await fireEvent.press(screen.getByTestId("review-ok"));
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ verdict: "ok", issues: [] }));
  });

  it("needs an option for Bad distractor, and the correct option can't be picked (REV-07, REV-08)", async () => {
    const { onSave } = await open();
    await fireEvent.press(screen.getByTestId("review-bad-distractor"));
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSave).not.toHaveBeenCalled();

    expect(screen.getByTestId(`review-distractor-${correct}`)).toBeDisabled();
    await fireEvent.press(screen.getByTestId(`review-distractor-${wrong[1]}`));
    await fireEvent.press(screen.getByTestId(`review-distractor-${wrong[0]}`));
    await fireEvent.press(screen.getByTestId("review-save"));
    const saved: ReviewRecord = onSave.mock.calls[0][0];
    expect(saved.distractors.map((d) => d.index)).toEqual([wrong[0], wrong[1]]);
    expect(saved.distractors[0]).toEqual({
      index: wrong[0],
      letter: "ABCD"[wrong[0]],
      text_en: variant.options[wrong[0]].text.en,
      text_si: variant.options[wrong[0]].text.si,
      tag: variant.options[wrong[0]].tag,
    });
  });

  it("asks for a name only when none is set (REV-09, REV-14)", async () => {
    await open();
    expect(screen.queryByTestId("review-name")).toBeNull();
    const onSetReviewerName = jest.fn();
    const { onSave } = await open({ reviewerName: "", onSetReviewerName });
    await fireEvent.press(screen.getByTestId("review-ok"));
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSave).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByTestId("review-name"), "නිමාලි");
    await fireEvent.press(screen.getByTestId("review-save"));
    expect(onSetReviewerName).toHaveBeenCalledWith("නිමාලි");
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ reviewer: "නිමාලි" }));
  });

  it("loads an existing mark and can clear it (REV-10, REV-11)", async () => {
    const existing: ReviewRecord = {
      item_id: item.id,
      variant_id: null,
      item_version: 1,
      spec_version: "0.5",
      pack: "mechanics-20",
      verdict: "issues",
      issues: ["bad-sinhala"],
      distractors: [],
      note: "old note",
      reviewer: "Test Reviewer",
      timestamp: "2026-11-07T10:00:00Z",
    };
    const { onClear } = await open({ existing });
    expect(screen.getByTestId("review-note")).toHaveDisplayValue("old note");
    expect(screen.getByTestId("review-bad-sinhala")).toBeSelected();
    await fireEvent.press(screen.getByTestId("review-clear"));
    expect(onClear).toHaveBeenCalled();
  });

  it("cancel saves nothing (REV-15)", async () => {
    const { onSave, onClose } = await open();
    await fireEvent.press(screen.getByTestId("review-ok"));
    await fireEvent.press(screen.getByTestId("review-cancel"));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});
