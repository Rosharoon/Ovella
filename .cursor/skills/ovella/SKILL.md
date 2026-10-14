---
name: ovella
description: >-
  Build and change the Ovella Expo app (period and pregnancy tracking). Use when
  editing Ovella screens, calendar, cycle dating, pregnancy weeks, appointments,
  hydration, symptoms, insights, or the week guide.
---

# Ovella

Expo SDK 52 app. React Native StyleSheet only. No Tailwind. Fonts are `fonts.display` (Playfair) and `fonts.body` / `bodySemi` / `bodyBold` (Nunito). Colors live in `src/theme/index.ts`. Icons are Ionicons. Data is local AsyncStorage (`ovella.state.${userId}`). Firebase is initialized in `src/firebase.ts` for project `ovella-d17b2`. iOS uses `GoogleService-Info.plist` and Android uses `google-services.json`. Both package ids are `com.ovella.app`. Cycle data is not stored in Firebase. Email, Apple, and Gmail sign-in are still local accounts.

After a code change, run `npx tsc --noEmit` and reload Expo with `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8081/reload` when Metro is up. Do not treat a browser screenshot as verification. Native `expo run:ios` fails on this machine (Xcode 15.0.1); the app runs in Expo Go.

Do not commit unless asked. Leave the Apple sign-in visual. You → Reminders and the Today bell persist period and 7:00 pm check-in notifications. Teen Mode’s own reminder switches still control teen notifications; the You switch also sets the teen period heads-up.

Date of birth is required at signup. Apple and Gmail sign-in show a date-of-birth popup that must be completed before the app continues. Under 18 opens Teen Mode and cannot switch into the adult period or pregnancy apps. You → Teen Mode opens preferences (interests, period and mood reminders, reminder time, discreet wording) and does not switch modes. Learn & Support lists chosen topics first. Teen Mode tracks periods with the same cycle logs. A teen can log a pregnancy from Today and stay in Teen Mode: the overview, pregnancy calendar, pregnancy check-in, week guide, and the teen Appointments & Care Plan screen. Baby arrived (from week 22) or Pregnancy ended returns them to teen period tracking and keeps the pregnancy log.

## Cycle

A period is logged only when its start is in `loggedPeriodStarts`. Predicted days stay highlighted until then. Say how many days late. Do not roll the anchor into an unlogged cycle.

Cycle length is 15–60. Ask at onboarding, recompute from the last up to 3 logged gaps in that range, and keep it editable in You → Cycle & pregnancy settings.

Ovulation day is `max(10, cycleLength - 14)`. The fertile window is ovulation day − 5 through ovulation day + 1, and only inside the open cycle when the period is not late. On calendars, the window is `ovulationSoft` / `ovulationBlue`. The peak day is `ovulationPeak`.

Period days use `periodPink` (`#D46B96`) and predicted period days use `periodPinkSoft` (`#F4D5E4`). Keep that pink in the rose family. Do not switch calendar period marks back to peach or to a hot pink.

## Pregnancy

Weeks come from the last period. `GESTATION_DAYS` is 280. `pregnancyWeek` is `floor(days since LMP / 7) + 1`, clamped for display. Changing the week in settings rewrites the last period and the due date together.

`pregnancyDatesFromSelection`: if the chosen day is today, today is not a logged period start, and an earlier recorded date exists, keep that earlier date as the last period. Otherwise the selected day is the last period.

Logging a pregnancy from period mode switches the app into pregnancy mode. The root navigator is keyed by stage so the tree remounts. Pregnancy tabs use `freezeOnBlur: false`.

Tabs are Today, Calendar, Log, Insights, You. There is no Baby tab. The week guide opens from Today. After logging a pregnancy, land on Insights.

## Screens

**Calendar (pregnancy):** opens on the current month. Scroll up for earlier months. Year view shows all 12 months. Pregnancy days are orange (`pregnancyOrangeSoft`), the due date is `dueOrange`, and period and ovulation marks stay visible. Tapping a date shows that day’s symptoms.

**Calendar (period):** same period and ovulation colors. Tapping a date shows that day’s symptoms. The Today week strip uses the same colors.

**Week guide:** horizontal cards. Open on the user’s current week unless a week param was passed. Only that current week is highlighted (rose border, petal fill, “This week”). Other weeks stay plain. Fruit art is `WeekIllustration` / `FruitGlyph`, one drawing per week 1–40. Put `key` on the `Svg` so a week change redraws.

**Insights:** a summary, not the week guide. Week of 40, trimester, symptoms from the last 14 days, next visit, and a link to the guide. Do not put the fruit week cards here.

**Symptoms:** stored as ids on `DayLog`. Show them with `SymptomCard` on Today and on the tapped calendar date. Labels come from `symptomLabel`.

**Appointments:** visit time and a separate reminder time. Place is a map pin when location is allowed, otherwise plain text. In settings, each visit is its own stacked card. Text wraps and the card grows. Do not scroll inside the card.

**Hydration:** opened from Today → Hydration check-in. One cup is 250 ml. Goal defaults to 8 cups. Gentle reminders are off until the user turns them on.

**Connected health data:** You → Connected health data opens Apple Health. Connect and Sync now share logged period days, nights with sleep hours, and today’s water. The link is stored at `ovella.health.${userId}`. Expo Go has no HealthKit entitlement, so the Health app itself updates from a standalone Ovella install. The popup closes from the X, Close, or the dimmed backdrop.

**Privacy & data:** You → Privacy & data, and Teen Mode → Read Privacy & data. Export shares a text copy of cycle, check-ins, appointments, and water without the password. Permissions show notification, location, and Apple Health status and open phone settings. Clear check-ins removes day logs. Delete tracking data clears logs, appointments, water, pregnancy records, and the health link, and returns a pregnant user to period tracking. Delete account signs out and removes that account’s stored data. The seed login stays available.

**Log:** pregnancy mode records pregnancy symptoms and hides Log pregnancy. Period mode keeps Log pregnancy.
