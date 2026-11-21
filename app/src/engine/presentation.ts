import type { Step } from "../../../engine/src/index";

// The engine returns a new state on each committed transition. An unchanged
// skip confirmation carries the exact same state and therefore the same token.
const tokens = new WeakMap<Step["state"], symbol>();
export function actionToken(state: Step["state"]) {
  let token = tokens.get(state);
  if (!token) {
    token = Symbol("study presentation");
    tokens.set(state, token);
  }
  return token;
}

export type SessionOwner = { readonly id: string };

export function present(step: Step, owner?: SessionOwner) {
  const session = step.state.session;
  return {
    next: step.next, feedback: step.feedback, moments: step.moments, hint: step.hint,
    owner, token: actionToken(step.state),
    spent: session?.spent ?? 0, budget: session?.budget ?? 0,
    confirmCard: step.next.kind === "confirm-skip" ? session?.served : undefined,
    recap: step.next.kind === "end" && step.next.end.recap,
  };
}
export type StudyView = ReturnType<typeof present>;

export function cancelSkip(view: StudyView): StudyView {
  if (view.next.kind !== "confirm-skip" || !view.confirmCard) return view;
  return { ...view, next: { kind: "card", card: view.confirmCard }, confirmCard: undefined };
}
