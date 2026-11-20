# Adaptive study sessions in the app

Set `EXPO_PUBLIC_STUDY_ENGINE=1` to enable the adaptive Today and topic study sessions. The default is the existing fixed queue. The study action on a skill opens its topic. Teacher review and opening a specific question keep their chosen items. The scheduler gets the bundled v1 edition, including its graphs and note references. It can serve across units. The selected unit supplies the initial student topic.

## Module boundary

Import the public `engine/src/index.ts` from one app adapter. Use the existing TypeScript sources directly. Metro needs visibility of the sibling directory and resolution of the engine's relative `.js` specifiers to their TypeScript files. Jest needs the same resolution. TypeScript already understands these specifiers. The adapter passes the built items and their ID-to-note map to `buildContent`. The screen looks up the exact item and variant returned by the engine. The simulator's file loader depends on Node and stays outside the mobile bundle.

## Device state and time

Use one AsyncStorage key for the local learner's engine state and ordered events. A single write commits a transition before the screen accepts another action. On failure retain the last committed state and allow retry. Initialize a first-time learner with `newState`. Pass saved state through `migrate` on every load.

Opening Today starts a session using epoch milliseconds. The engine closes an abandoned session as interrupted and assigns the new session to its Sri Lankan start day. On explicit exit call `endSession`. Reloading the adapter preserves the saved mid-session state and event sequence. Starting after an app restart follows the engine's interruption policy.

## Screen transitions

- Display the served variant for ordinary cards, reviews, repairs and closing cards. Keep scheduling reasons internal. Start the answer timer when the question becomes visible. Submit the option index or `dont-know` with elapsed milliseconds. Show the explanation before revealing the next step, and start the next timer after Continue.
- Pass skips to the engine. For `confirm-skip`, show the section's share and top skills, then let the learner confirm or return to the question. Offer “5 more” only for `offer-extend`.
- Show recognized feedback and optional hints. A `guess-nudge` offers “I don't know”. Additional fields need no special handling. End from `next.end`, including a cap reached before the first card.
- A recap asks no question. Use “Fixed today: X and Y.” when any skills were fixed, then “You got X and Y right today.” when any were answered correctly, otherwise “Tomorrow starts easy.” Show the session totals for an ordinary end.

Validate the adapter against direct public engine calls, both built editions, storage migration and reloading. Exercise the switch through the real session route and keep a separate opt-in Maestro smoke flow.
