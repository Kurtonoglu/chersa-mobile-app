# Chersa Mobile App — Project Memory

## Project
Frontend-only barber booking app. React Native + Expo SDK 55, TypeScript, Expo Router 3.x.
No backend, no API calls — all data in Zustand + mockData.ts.

## Key Files
- `/constants/colors.ts` — Colors object, always import from here
- `/constants/typography.ts` — FontSize, FontFamily, LineHeight
- `/lib/i18n.ts` — exports `t(scope)` and `setLocale(locale)`
- `/lib/mockData.ts` — all mock data
- `/lib/supabase.ts` — Supabase singleton client (reads EXPO_PUBLIC_* env vars)
- `/lib/alert.ts` — cross-platform confirm() utility
- `/store/useAppStore.ts` — single Zustand store (user, appointments, language, etc.)
- `/locales/bs.ts` — all Bosnian translation keys
- `/locales/en.ts` — English translations (assume same structure as bs.ts)
- `/services/auth.ts` — auth service stubs (mock now, Supabase later)
- `/services/appointments.ts` — appointment service stubs
- `/services/notifications.ts` — push notification registration stub

## Rules
- `--legacy-peer-deps` always when installing packages
- No hardcoded colors — use `Colors` from constants/colors.ts
- No hardcoded strings — use `t()` from lib/i18n.ts
- SafeAreaView on every screen
- Min 44x44 touch targets
- date-fns 2.x for dates
- No NativeWind in use (no babel.config.js in root) — use StyleSheet.create

## App Router Structure (built so far)
- `app/_layout.tsx` — Root Stack with dark bg, no headers, slide_from_right animation
- `app/index.tsx` — Onboarding: logo circle, shop name, tagline, BA/EN toggle, 2 buttons

## Design Tokens
- Background: #111111
- Accent/Gold: #C9A84C
- Text primary: #FFFFFF
- Text secondary: #A0A0A0
- Card bg: #1E1E1E
- Border: #2A2A2A

## Zustand Store State
- `currentUser: { name, phone, isLoggedIn }` — exported as `CurrentUser`
- `isHydrating: boolean` — true during initial loadUserFromStorage
- `authLoading / authError` — for login/register/logout API calls
- `appointmentsLoading / appointmentsError` — for appointment API calls
- `servicesLoading / servicesError` — for services API calls
- `clearErrors()` — clears all error fields at once
- `language: 'bs' | 'en'`
- `appointments`, `services`, `blockedDays`, `notifications`
- `barberAuthenticated: boolean`
- `bookingSelection: { date, serviceId, time }`
- `setLanguage` calls `setLocale` from i18n.ts automatically

## Fonts
- @expo-google-fonts/inter and expo-font NOT in package.json yet
- Using system fonts currently, FontFamily constants ready for when installed

## Backend Readiness (pre-backend fixes applied)
- `index.ts` imports `react-native-url-polyfill/polyfill` as first line
- `SHOP_INFO.closeTime = '18:00'`, `bufferMinutes = 5`
- `slotCalculator.ts` steps by 5 min (SLOT_STEP_MIN), WORK_END_MIN = 18*60
- `i18n.ts` locale fallback: `'bs' ? 'bs' : 'en'` (was always 'bs')
- Supabase env vars: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY (see .env.example)
- Services pattern: `{ data: T | null, error: string | null }` — matches Supabase shape
