# CLAUDE.md — Project Instructions for Claude Code

## IMPORTANT — Read This First

Before doing anything in this project, always read the file `PROMPT.md` located in the project root. That file contains the complete project specification including:

- Full tech stack and exact versions to use
- Complete design system with colors, fonts, and style rules
- All mock data including services, prices, durations, and shop info
- Complete booking flow logic and slot calculator rules
- Every screen description for both client and barber sides
- File structure to follow exactly
- All additional requirements and constraints

**Never make assumptions. If something is not clear, refer back to PROMPT.md.**

---

## Commands

```bash
# Start development server
npx expo start

# Start for Android
npx expo start --android

# Start for iOS
npx expo start --ios

# Install packages (always use legacy-peer-deps)
npm install <package> --legacy-peer-deps
```

---

## Key Rules

- Always use `--legacy-peer-deps` when installing any npm package
- Never use hardcoded color values — always import from `/constants/colors.ts`
- Never use hardcoded strings — always use the `t()` function from `/lib/i18n.ts`
- Never make API calls or import Supabase — this is frontend only phase
- Always use `SafeAreaView` from `react-native-safe-area-context` on every screen
- All touch targets must be minimum 44x44 points
- Use `date-fns` version 2.x for all date logic
- Use Zustand store (`/store/useAppStore.ts`) for all state

---

## Project Structure

```
/app          → All screens using Expo Router file-based routing
/components   → Reusable UI components
/constants    → colors.ts and typography.ts
/lib          → mockData.ts, slotCalculator.ts, i18n.ts
/locales      → bs.ts (Bosnian) and en.ts (English)
/store        → useAppStore.ts (single Zustand store)
/hooks        → Custom React hooks
/assets       → Images and fonts
```

---

## Current Phase

This is the **frontend-only prototype phase**. No backend integration yet. All data comes from `/lib/mockData.ts` and lives in Zustand state only. Nothing persists on refresh — that is intentional and acceptable for this phase.
