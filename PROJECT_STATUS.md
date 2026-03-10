# Chersa App — Project Status

## All Screens Built ✅

### app/
- `_layout.tsx`
- `index.tsx` (onboarding)

### app/(auth)/
- `_layout.tsx`
- `login.tsx` ⚠️ flagged in PROMPT as needing auth review
- `register.tsx` ⚠️ flagged in PROMPT as needing auth review

### app/(client)/
- `_layout.tsx`
- `index.tsx` (Početna)
- `termini.tsx`
- `notifikacije.tsx`
- `postavke.tsx`
- `booking/date.tsx`
- `booking/service.tsx`
- `booking/time.tsx`
- `booking/confirm.tsx`

### app/(barber)/
- `_layout.tsx`
- `pin.tsx`
- `dashboard.tsx`
- `kalendar.tsx`
- `rezervacije.tsx`
- `usluge.tsx`
- `postavke.tsx`

---

## Core Files Built ✅

- `constants/colors.ts`
- `constants/typography.ts`
- `lib/mockData.ts`
- `lib/slotCalculator.ts`
- `lib/i18n.ts`
- `lib/alert.ts`
- `locales/bs.ts`
- `locales/en.ts`
- `store/useAppStore.ts`
- `components/common/Button.tsx`
- `components/common/Card.tsx`
- `components/common/Badge.tsx`
- `components/common/Header.tsx`
- `components/common/EmptyState.tsx`
- `components/common/LoadingSpinner.tsx`
- `components/common/ScreenHeader.tsx`

---

## Missing / Not Built ❌

These are listed in PROMPT.md file structure but logic is implemented inline in screens instead:

- `components/booking/ServiceCard.tsx`
- `components/booking/TimeSlot.tsx`
- `components/booking/DateCalendar.tsx`
- `components/booking/BookingCard.tsx`
- `components/barber/AppointmentCard.tsx`
- `components/barber/DayBlock.tsx`
- `hooks/useLanguage.ts`
- `README.md`

---

## Known Issues / To Fix

- Auth screens (login, register) may need review for OTP flow, AsyncStorage persistence, and validation
- Visual and functional bugs found during testing — to be tracked and fixed incrementally

---

*Last updated: 2026-03-09*
