import { AppState } from "react-native";
import { useIsFocused } from "expo-router";
import { AnswerClock } from "./answerClock";
import { cancelSkip, type StudyView } from "./presentation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Choice, Moment, Served, Step } from "../../../engine/src/index";
import { Txt } from "../components/Txt";
import { Button, Chip, Figure } from "../components/ui";
import { constantsLine, getItem, mistakeMessage, type Lang } from "../content/pack";
import { figureSvg } from "../content/figureEngines";
import { skillName } from "../content/graph";
import { useStore } from "../state/store";
import { recapText } from "./study";
import { deviceSession } from "./device";

type Result = { served: Served; choice: Choice };
type Action = () => Promise<Step>;

export function EngineStudy({ topic, onExit }: { topic?: string; onExit: () => void }) {
  const [app] = useState(deviceSession);
  const [initialTopic] = useState(topic);
  const store = useStore();
  const [step, setStep] = useState<StudyView>();
  const [result, setResult] = useState<Result>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const active = useRef(false);
  const locked = useRef(false);
  const started = useRef<Promise<Step> | null>(null);
  const retry = useRef<() => void>(() => {});
  const [clock] = useState(() => new AnswerClock());
  const focused = useIsFocused();

  async function apply(action: Action, done?: (next: Step) => void) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(false);
    setRecovered(false); // The notice belongs to the opening card only.
    retry.current = () => { void apply(action, done); };
    try {
      const next = await action();
      if (active.current) {
        setStep(app.present(next));
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
      void apply(() => {
        started.current = app.start(Date.now(), initialTopic);
        return started.current;
      }, () => setRecovered(!!app.takeRecoveryNotice()));
    });
    return () => {
      cancelled = true;
      active.current = false;
      // System back also leaves the session. A killed process has no cleanup;
      // startSession handles that saved session as interrupted on next launch.
      void started.current?.then(first => {
        const id = app.present(first).owner;
        if (id) return app.end(Date.now(), id);
      }).catch(() => {});
    };
  }, [app, initialTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = step?.next;
  const question = next?.kind === "card" ? next.card : undefined;
  useLayoutEffect(() => {
    const change = (state: string) => clock.foreground(state === "active");
    const sub = AppState.isAvailable ? AppState.addEventListener("change", change) : undefined;
    change(AppState.currentState ?? "unknown");
    return () => { sub?.remove(); clock.foreground(false); };
  }, [clock]);
  useLayoutEffect(() => {
    clock.show(step?.token, focused && !!question && !result && !error && !busy);
  }, [clock, step?.token, focused, question, result, error, busy]);

  const token = step?.token;
  const exit = () => { void apply(() => app.end(Date.now(), token), onExit); };
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

  if (error) return <>
    <Txt>Could not load or save your study session.</Txt>
    <Button label="Retry" testID="engine-retry" disabled={busy} onPress={() => retry.current()} />
    <Button label="Back" disabled={busy} onPress={onExit} />
  </>;
  if (!step || !next) return <Txt>Opening study session…</Txt>;

  const notification = <>
    {recovered && <Txt testID="engine-recovered">
      {"Your saved study could not be opened, so a new one was started. A copy was kept on this phone."}
    </Txt>}
    {step.hint === "guess-nudge" && <Txt testID="guess-nudge">{"Not sure? Tap I don't know. It costs nothing."}</Txt>}
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
      <Button label="Continue" testID="engine-continue" disabled={busy} onPress={() => setResult(undefined)} />
    </>;
  }

  if (next.kind === "end") {
    const end = next.end;
    return <>
      {!step.recap && notification}
      <Txt size={22} weight="semibold" testID="engine-end">
        {step.recap ? recapText(end, name) : end.kind === "daily-cap" && !end.cards ? "Done for today." : "Session complete."}
      </Txt>
      {!step.recap && <Txt>{`${end.right} right across ${end.cards} cards · ${end.effort} effort`}</Txt>}
      <Button label="Done" testID="engine-done" disabled={busy} onPress={onExit} />
    </>;
  }
  if (next.kind === "offer-extend") return <>
    {notification}
    <Txt>Keep studying?</Txt>
    <Button label="5 more" testID="engine-extend" disabled={busy} onPress={() => { void apply(() => app.extend(Date.now(), token)); }} />
    <Button label="Finish" testID="engine-finish" disabled={busy} onPress={() => { void apply(() => app.end(Date.now(), token)); }} />
  </>;
  if (next.kind === "confirm-skip") {
    const served = step.confirmCard;
    if (served) return <>
      <Txt>{`${section(next.value.section)} accounts for ${next.value.sharePct}% of this unit.`}</Txt>
      {next.value.topSkills.map(s => <Txt key={s.skill}>{name(s.skill)}</Txt>)}
      <Button label="Skip section" disabled={busy} onPress={() => { void apply(() => app.skip(served.card, Date.now(), "later", true, token)); }} />
      <Button label="Keep studying" disabled={busy} onPress={() => setStep(cancelSkip(step))} />
    </>;
  }
  const item = question && getItem(question.card);
  const variant = item && question && item.variants[question.variant];
  if (!question || !item || !variant) return <>
    <Txt>This study step is unavailable.</Txt>
    <Button label="End session" disabled={busy} onPress={exit} />
  </>;
  const svg = figureSvg(variant.figure);
  const submit = (choice: Choice) => {
    const now = Date.now();
    const ms = Math.round(clock.elapsed());
    void apply(() => app.answer(question.card, choice, ms, now, token), s => {
      if (s.feedback) {
        setResult({ served: question, choice });
      }
    });
  };
  return <>
    {notification}
    <Txt testID="engine-budget" tone="muted">{`Effort ${step.spent} / ${step.budget}`}</Txt>
    <Chip label="EN" active={store.settings.showEnglish} onPress={() => store.setSettings({ showEnglish: !store.settings.showEnglish })} />
    <Txt size={20} weight="medium" testID="engine-question">{bilingual(variant.stem)}</Txt>
    {Object.keys(item.constants).length > 0 && <Txt>{constantsLine(item.constants)}</Txt>}
    {svg && <Figure svg={svg} maxWidth={300} />}
    {variant.options.map((o, i) => <OptionButton key={i} svg={o.svg} index={i} label={bilingual(o.text)} busy={busy} choose={submit} />)}
    <Button label="I don't know" testID="engine-idk" disabled={busy} onPress={() => submit("dont-know")} />
    <Button label="Not now" testID="engine-skip" disabled={busy} onPress={() => { void apply(() => app.skip(question.card, Date.now(), "later", false, token)); }} />
    <Button label="Too hard" testID="engine-too-hard" disabled={busy} onPress={() => { void apply(() => app.skip(question.card, Date.now(), "too-hard", false, token)); }} />
    <Button label="End session" testID="engine-stop" disabled={busy} onPress={exit} />
  </>;
}

function OptionButton({ index, label, svg, busy, choose }: {
  index: number; label: string; svg?: string; busy: boolean; choose: (choice: Choice) => void;
}) {
  return <>
    {svg && <Figure svg={svg} maxWidth={170} />}
    <Button kind="secondary" testID={`engine-option-${index}`} disabled={busy} label={label || `Option ${index + 1}`}
      style={{ height: "auto", minHeight: 52, paddingVertical: 10 }} onPress={() => choose(index)} />
  </>;
}
