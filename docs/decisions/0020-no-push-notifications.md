# DR-0020: No push notifications, no teacher-voice nudges, no dependence on class enrollment

- **Status:** Accepted
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Product

## Context
Three of the suggested retention levers were rejected:
- "Make it part of the class": we can't force every student in a class to enrol.
- Push notifications: annoying.
- Notifications in the teacher's voice: silly.

## Options considered
1. Keep push reminders at the chosen study time (the earlier plan)
2. **No push. Passive or opt-in triggers only: a home-screen widget, opt-in WhatsApp (off by default), and friend activity inside the app** ✅

## Decision
- **No push notifications** for study reminders. No teacher-voice messaging.
- The app must **work fully for a student whose class isn't on UniKey.** The teacher dashboard and class features are a bonus when they exist, never a requirement.
- Triggers: an Android **home-screen widget** showing the streak and today's 5 questions; an **opt-in WhatsApp reminder** (off by default); and friend streaks, leagues and duels for students who opt in.
- The re-engagement ladder becomes: day 2 a WhatsApp nudge (only if opted in) or a friend nudge → day 4 a "welcome back" 3-minute session waiting in the app → day 7 the inactive flag on the teacher dashboard (only if the class is enrolled).

## Revisit triggers
- Pilot D7 retention well below target, and exit interviews say students forgot → test an opt-in, student-scheduled reminder
- Review date: 2027-04-01

## Consequences
+ A calm, respectful product; it fits the calm "Dawn" design ([DR-0025](0025-dawn-design-system.md))
− Fewer re-engagement levers. Leans harder on the widget, friends and visible progress.
