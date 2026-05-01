# POP'S Driver

Sister app to **POP'S Villepinte** — the driver / delivery side of the platform.

Built with the **same design system** (colors, fonts, spacing, components) as the
customer app so the two share a single visual identity.

---

## Stack

- **Expo SDK 55** + **expo-router** (file-based routing)
- **Nativewind v5** (Tailwind for React Native) — same `tailwind.config.js`
- **Zustand** + AsyncStorage (mirrors customer-app store pattern)
- **@rnmapbox/maps** + **@youssefhenna/expo-mapbox-navigation** for turn-by-turn
- **Reanimated 4** for the press / spring animations
- **Lucide** for icons, **Bebas Neue** + **Poppins** for type

## Why a separate app

- Different App Store listing, different reviewers, different audience
- Driver-only code (background location, turn-by-turn, route mgmt) doesn't ship
  to every customer
- Independent release cadence — driver hotfixes don't gate customer releases

The two apps live side by side in `pops villepinte/`. A shared package
(`packages/shared`) can be added later to dedupe the API client + types.

---

## Setup

```bash
cd "pops-villepinte-driver"
cp .env.example .env          # then fill in your Mapbox tokens
npm install
npx expo prebuild --clean     # required: native modules can't run in Expo Go
npm run ios                   # or: npm run android
```

> **Expo Go won't work** — the Mapbox Navigation SDK is a native module.
> You must use a custom dev client (`expo prebuild` + `expo run:ios|android`),
> or build with EAS (`eas build --profile development`).

### Mapbox tokens

Two tokens are required (see `.env.example`):

| Token | Prefix | Where it's used | Scope |
|---|---|---|---|
| `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN` | `pk.` | Runtime (maps, nav SDK) | restrict to your bundle IDs |
| `MAPBOX_DOWNLOADS_TOKEN` | `sk.` | Build time (CocoaPods / Gradle) | must include `Downloads:Read` |

The downloads token must also be set as an EAS secret for cloud builds:

```bash
eas secret:create --name MAPBOX_DOWNLOADS_TOKEN --value sk.xxx --type string
eas secret:create --name EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN --value pk.xxx --type string
```

For local builds, the secret token also needs to be in your `~/.netrc`:

```
machine api.mapbox.com
  login mapbox
  password sk.xxx
```

---

## Project layout

```
src/
├── app/                  # expo-router screens
│   ├── _layout.tsx       # splash → onboarding → auth → signup → tabs
│   ├── (tabs)/           # 4-tab bottom nav
│   │   ├── index.tsx     # Tournée — current run / dashboard
│   │   ├── deliveries.tsx
│   │   ├── earnings.tsx
│   │   └── profile.tsx
│   ├── delivery/[id].tsx # detail + status timeline
│   ├── navigate/[id].tsx # full-screen Mapbox turn-by-turn
│   └── settings/[slug].tsx
├── components/           # mirrors customer-app conventions
│   ├── auth/ onboarding/ splash/
│   ├── common/  IconButton, Toast
│   ├── form/    TextField
│   ├── layout/  Screen
│   ├── home/    Greeting, SectionHeader
│   ├── delivery/  DeliveryCard, DeliveryStatusPill, OnlineToggle, ...
│   ├── earnings/  EarningsHeroCard
│   └── profile/   SettingsRow, StatsCard
├── constants/   theme.ts, fonts.ts        # IDENTICAL to customer app
├── data/        deliveries.ts             # mock data (replace with API)
├── lib/         format.ts, mapbox.ts
├── store/       auth, profile, deliveries, earnings (Zustand + AsyncStorage)
└── types/       index.ts
```

## Design system

Cloned 1:1 from the customer app:

- **Colors** — `#FFCE00` primary, `#E3000F` accent, `#1DB954` success, etc.
- **Fonts** — Bebas Neue (display) + Poppins 400/500/600/700
- **Tailwind config + global.css + postcss config** — copied verbatim
- **Layout primitives** — `Screen`, `IconButton`, `Toast`, `TextField` are
  byte-for-byte equivalents so a future shared package will be a clean lift

## Mock auth

Same pattern as the customer app: phone-gated. The known driver phone is
`0612345678` (skip signup). Any other number triggers the signup form.

## Assets

The `assets/images/` folder is empty — copy `icon.png`, `pops-logo.png`,
`favicon.png`, and the Android adaptive-icon set from the customer app
(`pops-villepinte/assets/images/`) before building. Same logo, same identity.
