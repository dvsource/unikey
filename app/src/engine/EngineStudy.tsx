import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Choice, Moment, Served, Step } from "../../../engine/src/index";
import { Txt } from "../components/Txt";
import { Button, Chip, Figure } from "../components/ui";
import { constantsLine, getItem, mistakeMessage, packs, type Lang } from "../content/pack";
import { figureSvg } from "../content/figureEngines";
import { skillName } from "../content/graph";
import { useStore } from "../state/store";
import { recapText, StudySession, studyContent } from "./study";

let device: StudySession | undefined;
function deviceSession() {
  return device ??= new StudySession(studyContent(packs), AsyncStorage, Date.now() >>> 0);
}

type Result = { served: Served; choice: Choice };
type Action = () => Promise<Step>;

export function EngineStudy({ topic, onExit }: { topic?: string; onExit: () => void }) {
  const [app] = useState(deviceSession);
  const [initialTopic] = useState(topic);
  const store = useStore();
  const [step, setStep] = useState<Step>();
  const [result, setResult] = useState<Result>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const active = useRef(false);
  const locked = useRef(false);
  const opened = useRef(false);
  const retry = useRef<() => void>(() => {});
  const shownAt = useRef(0);

  async function apply(action: Action, done?: (next: Step) => void) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(false);
    retry.current = () => { void apply(action, done); };
    try {
      const next = await action();
      if (active.current) {
        setStep(next);
        done?.(next);
      }
    } catch {
      if (active.current) setError(true);
    } finally {
      locked.current = false;
      if (active.current) setBusy(false);
    }
  }

  useEffect(() => {
    active.current = true;
    let cancelled = false;
    // A discarded mount must not start or interrupt a session.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      opened.current = true;
      void apply(() => app.start(Date.now(), initialTopic));
    });
    return () => {
      cancelled = true;
      active.current = false;
      // System back also leaves the session. A killed process has no cleanup;
      // startSession handles that saved session as interrupted on next launch.
      if (opened.current) void app.end(Date.now()).catch(() => {});
    };
  }, [app, initialTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = step?.next;
  const question = next?.kind === "card" ? next.card : undefined;
  useLayoutEffect(() => {
    if (question && !result) shownAt.current = performance.now();
  }, [question, result]);

  const exit = () => { void apply(() => app.end(Date.now()), onExit); };
  const name = (id: string) => skillName(id).si ?? skillName(id).en;
  const section = (id: string) => app.content.sections[id]?.name ?? id;
  function momentText(moment: Moment) {
    switch (moment.type) {
      case "missing-piece-fixed": return `Fixed today: ${name(moment.skill)}.`;
      case "height-up": return `${name(moment.skill)} reached level ${moment.to}.`;
      case "then-wrong-now-right": return `You got ${name(moment.skill)} right this time.`;
      case "section-solid": return `${section(moment.section)} is solid.`;
      case "avoided-now-done": return `You came back to ${section(moment.section)}.`;
    }
  }
  const bilingual = (text: Lang) => store.settings.showEnglish && text.si && text.si !== text.en
    ? text.si + "\n" + text.en : text.si ?? text.en;
  const button = (label: string, onPress: () => void, id?: string) =>
    <Button label={label} disabled={busy} onPress={onPress} testID={id} />;

  if (error) return <>
    <Txt>Could not load or save your study session.</Txt>
    {button("Retry", () => retry.current(), "engine-retry")}
  </>;
  if (!step || !next) return <Txt>Opening study session…</Txt>;

  const notification = <>
    {step.hint === "guess-nudge" && <Txt testID="guess-nudge">Not sure? Tap I don't know. It costs nothing.</Txt>}
    {(step.moments ?? []).map((m, i) => {
      const text = momentText(m);
      return text ? <Txt key={i}>{text}</Txt> : null;
    })}
  </>;

  if (result && step.feedback) {
    const item = getItem(result.served.card)!;
    const options = item.variants[result.served.variant].options;
    const picked = typeof result.choice === "number" ? options[result.choice] : undefined;
    const mistake = picked && !step.feedback.right ? mistakeMessage(picked) : null;
    return <>
      {result.choice !== "dont-know" && <Txt weight="semibold">{step.feedback.right ? "Correct" : "Not quite"}</Txt>}
      <Txt>{`Correct answer: ${bilingual(options[step.feedback.correctIndex].text)}`}</Txt>
      {mistake && <Txt>{bilingual(mistake.text)}</Txt>}
      <Txt testID="engine-explanation">{bilingual(item.explanation)}</Txt>
      {step.feedback.reveal && <Txt>{`You came back to ${section(step.feedback.reveal.section)}.`}</Txt>}
      {button("Continue", () => setResult(undefined), "engine-continue")}
    </>;
  }

  if (next.kind === "end") {
    const end = next.end;
    return <>
      {notification}
      <Txt size={22} weight="semibold" testID="engine-end">
        {end.recap ? recapText(end, name) : end.kind === "daily-cap" && !end.cards ? "Done for today." : "Session complete."}
      </Txt>
      {!end.recap && <Txt>{`${end.right} right across ${end.cards} cards · ${end.effort} effort`}</Txt>}
      {button("Done", onExit, "engine-done")}
    </>;
  }
  if (next.kind === "offer-extend") return <>
    {notification}
    <Txt>Keep studying?</Txt>
    {button("5 more", () => { void apply(() => app.extend(Date.now())); }, "engine-extend")}
    {button("Finish", () => { void apply(() => app.end(Date.now())); }, "engine-finish")}
  </>;
  if (next.kind === "confirm-skip") {
    const served = step.state.session?.served;
    if (served) return <>
      <Txt>{`${section(next.value.section)} accounts for ${next.value.sharePct}% of this unit.`}</Txt>
      {next.value.topSkills.map(s => <Txt key={s.skill}>{name(s.skill)}</Txt>)}
      {button("Skip section", () => { void apply(() => app.skip(served.card, Date.now(), "later", true)); })}
      {button("Keep studying", () => setStep({ ...step, next: { kind: "card", card: served } }))}
    </>;
  }
  const item = question && getItem(question.card);
  const variant = item && question && item.variants[question.variant];
  if (!question || !item || !variant) return <>
    <Txt>This study step is unavailable.</Txt>
    {button("End session", exit)}
  </>;
  const svg = figureSvg(variant.figure);
  const submit = (choice: Choice) => {
    const now = Date.now();
    const ms = Math.max(0, Math.round(performance.now() - shownAt.current));
    void apply(() => app.answer(question.card, choice, ms, now), s => {
      if (s.feedback) {
        setResult({ served: question, choice });
        store.recordAnswer(item.id, s.feedback.right);
      }
    });
  };
  return <>
    {notification}
    <Txt testID="engine-budget" tone="muted">{`Effort ${step.state.session?.spent ?? 0} / ${step.state.session?.budget ?? 0}`}</Txt>
    <Chip label="EN" active={store.settings.showEnglish} onPress={() => store.setSettings({ showEnglish: !store.settings.showEnglish })} />
    <Txt size={20} weight="medium" testID="engine-question">{bilingual(variant.stem)}</Txt>
    {Object.keys(item.constants).length > 0 && <Txt>{constantsLine(item.constants)}</Txt>}
    {svg && <Figure svg={svg} maxWidth={300} />}
    {variant.options.map((o, i) => <OptionButton key={i} svg={o.svg} index={i} label={bilingual(o.text)} busy={busy} choose={submit} />)}
    {button("I don't know", () => submit("dont-know"), "engine-idk")}
    {button("Not now", () => { void apply(() => app.skip(question.card, Date.now(), "later")); }, "engine-skip")}
    {button("Too hard", () => { void apply(() => app.skip(question.card, Date.now(), "too-hard")); }, "engine-too-hard")}
    {button("End session", exit, "engine-stop")}
  </>;
}

function OptionButton({ index, label, svg, busy, choose }: {
  index: number; label: string; svg?: string; busy: boolean; choose: (choice: Choice) => void;
}) {
  return <>
    {svg && <Figure svg={svg} maxWidth={170} />}
    <Button kind="secondary" testID={`engine-option-${index}`} disabled={busy} label={label} onPress={() => choose(index)} />
  </>;
}
