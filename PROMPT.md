# Chersa Barber App — Full Project Prompt (Updated)

## Project Overview

You are building a complete frontend-only mobile app called **Chersa** for Frizerski salon Chersa in Travnik, Bosnia and Herzegovina. This is a barber booking app for a single barber working alone. Built with React Native + Expo SDK 55. All data is mock data only — no backend, no Supabase calls, no real SMS in this phase.

---

## Tech Stack — Use Exactly These, No Substitutions

- React Native with Expo SDK 55
- Expo Router 3.x for navigation
- TypeScript strictly — no `any` types
- NativeWind 4.x with Tailwind CSS 3.x for styling
- Zustand 4.x for state management
- AsyncStorage for persistent auth state
- date-fns 2.x for all date and time logic
- React Hook Form 7.x for all forms
- i18n-js 4.x with expo-localization for language support
- expo-notifications for notification UI
- All screens must use SafeAreaView from react-native-safe-area-context
- All touch targets minimum 44x44 points
- Use --legacy-peer-deps flag if installing any additional packages

---

## Design System — Follow Exactly

- Background: #111111
- Accent / Gold: #C9A84C
- Text primary: #FFFFFF
- Text secondary: #A0A0A0
- Card background: #1E1E1E
- Border color: #2A2A2A
- Success: #4CAF50
- Warning: #FFC107
- Error: #F44336
- Font: Inter (use expo-google-fonts/inter when available, system font fallback for now)
- Style: dark, premium, masculine, clean, minimal
- Every screen has a dark atmospheric barbershop header using a dark gradient placeholder
- Bottom tab navigation for client side with 5 tabs
- Status badges color coded: green = confirmed, yellow = pending, red = cancelled
- Smooth transitions between screens
- Loading states on every async simulation (500ms delay)
- Friendly empty state messages with personality — written in active language

---

## Language System

- Default language: Bosnian (bs)
- Second language: English (en)
- Implement using i18n-js 4.x and expo-localization
- Create /locales/bs.ts — all Bosnian translations
- Create /locales/en.ts — all English translations
- Create /lib/i18n.ts — initializes i18n-js, exports t() function
- Every single piece of UI text must use t() — no hardcoded strings except mock data
- Language toggle accessible from onboarding screen and from client Postavke
- Switching language updates all text instantly without restarting
- Store selected language in Zustand store

---

## Authentication System — Important

### Registration (one time only)
- Fields: Full name, phone number, password (with show/hide eye icon toggle), confirm password
- Validation: name min 3 chars, phone min 9 digits, password min 6 chars, passwords must match
- Flow: fill form → tap "Registruj se" → SMS OTP field appears → enter mock code 1234 → account created → navigate to client home
- SMS OTP verification happens ONLY during registration to confirm the phone number is real
- After registration user is permanently logged in until they explicitly log out

### Login (every time after registration)
- Fields: phone number + password only
- NO SMS code on login — just phone + password → tap "Prijavi se" → logged in → navigate to client home
- Mock validation: any phone + any password that is 6+ chars logs in successfully (no real auth yet)
- Fast and frictionless — no OTP friction on repeat logins

### Persistent Authentication
- When user logs in or registers, save their data to AsyncStorage
- When app starts, check AsyncStorage for saved user data
- If saved data exists, skip onboarding screen and go directly to client home
- User stays logged in until they explicitly tap "Odjavi me" in Postavke
- On logout: clear AsyncStorage, clear Zustand store, navigate to onboarding

### Both Auth Screens
- Back arrow button in top left corner navigates back to onboarding screen
- Dark background, gold accents on inputs and buttons
- Inline validation error messages in red below each field
- Link at bottom to switch between login and register

---

## Mock Data — /lib/mockData.ts

### Shop Info
- Name: Frizerski salon Chersa
- Address: Bosanska 103, Travnik
- Phone: 062906329
- Instagram: frizerski_salon_chersa
- Google Maps coordinates: 44.2269016, 17.6623864
- Working days: Monday to Saturday (Sunday closed)
- Working hours: 09:00 to 18:00
- Buffer between appointments: 5 minutes

### Services

**KOSA**
| Name (BS) | Name (EN) | Price | Duration |
|---|---|---|---|
| Šišanje | Haircut | 10 KM | 20 min |
| Šišanje za djecu (do 12 godina) | Children's haircut | 8 KM | 15 min |
| Šišanje na kratko (na nulu, na keca) | Short haircut | 8 KM | 15 min |
| Pranje i feniranje kose | Hair wash and blowdry | 3 KM | 10 min |

**BRADA**
| Name (BS) | Name (EN) | Price | Duration |
|---|---|---|---|
| Skraćivanje brade | Beard trim | 2 KM | 10 min |
| Skraćivanje i oblikovanje brade mašinom | Beard trim and shape (machine) | 3 KM | 10 min |
| Skraćivanje brade i oblikovanje britvom | Beard trim and shape (razor) | 5 KM | 15 min |
| DELUXE brada | DELUXE beard | 8 KM | 20 min |

**PAKETI**
| Name (BS) | Name (EN) | Price | Duration |
|---|---|---|---|
| Full paket | Full package | 20 KM | 45 min |
| DELUXE paket | DELUXE package | 25 KM | 50 min |

Full paket includes: šišanje, skraćivanje i oblikovanje brade, pranje i feniranje, styling
DELUXE paket includes: šišanje, DELUXE brada, pranje i feniranje 2x, styling

### Mock Appointments
Hardcode 10 realistic appointments spread across today and the next 5 days. Use Bosnian names and phone numbers. Mix services and statuses (potvrđeno / na čekanju / otkazano).

### Blocked Days
Block one day next week with reason "Slobodan dan"

### Mock User
- Name: Nedim Kurtović
- Phone: +38762156059
- Password: (any password works in mock phase)

---

## Booking Flow Logic — Critical

This is the most important logic in the entire app. Implement exactly as described.

**Flow order: Date → Service → Time → Confirm**

**Slot calculation rules:**
- Time slots are NOT fixed intervals — they are dynamically generated
- System works on a continuous timeline from 09:00 to 18:00
- Each service has a specific duration in minutes plus a 5 minute buffer
- When a date is selected, calculate all booked time ranges for that day from mock appointments
- When a service is selected, find all valid start times where full service duration + buffer fits within a free gap
- Only show start times where the service fits completely before 18:00
- Services with zero valid start times on chosen date are shown dimmed with "Nema termina" label
- If no services available on chosen date, show suggestion for next available day
- When a new mock booking is added to state, it immediately affects available slots for that day

**Create /lib/slotCalculator.ts** as a pure function:
- Input: date (Date), serviceDuration (number in minutes), existingAppointments (array), bufferMinutes (number)
- Output: array of available start time strings e.g. ["09:00", "09:25", "10:15"]

---

## File Structure

```
/app
  /(auth)
    _layout.tsx
    login.tsx
    register.tsx
  /(client)
    _layout.tsx        ← bottom tab navigator
    index.tsx          ← Početna (Home)
    /booking
      date.tsx
      service.tsx
      time.tsx
      confirm.tsx
    termini.tsx
    notifikacije.tsx
    postavke.tsx
  /(barber)
    _layout.tsx
    pin.tsx
    dashboard.tsx
    kalendar.tsx
    rezervacije.tsx
    usluge.tsx
    postavke.tsx
  index.tsx            ← splash/onboarding
  _layout.tsx          ← root layout
/components
  /common
    Button.tsx
    Card.tsx
    Badge.tsx
    Header.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
    ScreenHeader.tsx
  /booking
    ServiceCard.tsx
    TimeSlot.tsx
    DateCalendar.tsx
    BookingCard.tsx
  /barber
    AppointmentCard.tsx
    DayBlock.tsx
/constants
  colors.ts
  typography.ts
/lib
  mockData.ts
  slotCalculator.ts
  i18n.ts
/locales
  bs.ts
  en.ts
/store
  useAppStore.ts
/hooks
  useLanguage.ts
```

---

## Zustand Store — /store/useAppStore.ts

Single store containing:

**State:**
- currentUser — { name, phone, isLoggedIn }
- appointments — array, initialized from mockData
- blockedDays — array, initialized from mockData
- services — array, initialized from mockData
- language — 'bs' | 'en', default 'bs'
- barberAuthenticated — boolean, default false
- notifications — array of mock notifications

**Actions:**
- addAppointment
- cancelAppointment
- confirmAppointment
- blockDay
- unblockDay
- setLanguage
- setBarberAuthenticated
- toggleServiceActive
- updateService
- addService
- addNotification
- markNotificationRead
- loginUser
- logoutUser

---

## Screens — Client Side

### app/index.tsx — Splash / Onboarding
- Full dark screen
- Circular gold border logo placeholder with "C" in center
- Shop name "Frizerski salon Chersa" in gold accent color
- Tagline in active language: "Stil koji govori sam za sebe." (BS) / "Style that speaks for itself." (EN)
- Language toggle BA / EN top right corner — switches all app text instantly
- Two buttons: "Prijavi se" (outlined) and "Registracija" (gold filled)
- On app start: check AsyncStorage for saved user — if found, skip this screen and go directly to client home automatically

### app/(auth)/register.tsx — Registracija
- Dark screen, back arrow top left → onboarding
- Shop name at top
- Fields: Ime i prezime, Broj mobitela (with +387 prefix shown), Lozinka (with show/hide eye toggle), Potvrdi lozinku
- Gold border on focused inputs
- Inline red validation errors below each field
- "Registruj se" button — gold filled
- On tap: validate all fields → show 4-digit OTP input with hint "Unesi: 1234"
- "Potvrdi" verifies mock code 1234
- On success: save user to AsyncStorage + Zustand store, navigate to client home
- Link at bottom: "Već imaš račun? Prijavi se"

### app/(auth)/login.tsx — Prijava
- Dark screen, back arrow top left → onboarding
- Shop name at top
- Fields: Broj mobitela, Lozinka (with show/hide eye toggle)
- Gold border on focused inputs
- Inline red validation errors below each field
- "Prijavi se" button — gold filled
- On tap: validate phone (min 9 digits) + password (min 6 chars) → save to AsyncStorage + Zustand → navigate to client home
- No SMS code on login
- Link at bottom: "Nemaš račun? Registruj se"

### app/(client)/index.tsx — Početna
- Dark atmospheric header with logo placeholder centered, shop name in gold below
- Large gold "REZERVIŠI" button → navigates to booking date screen
- "O nama" section with short shop description
- Contact section with three tappable rows (min 44pt height each):
  - Phone icon + 062 906 329 → action sheet with "Pozovi" and "Viber" options (show toast)
  - Instagram icon + @frizerski_salon_chersa → opens Instagram URL
  - Location pin + "Bosanska 103, Travnik" → opens Google Maps at 44.2269016, 17.6623864
- Hidden "Barber pristup" small text link at very bottom → barber PIN screen
- Bottom tab bar visible

### app/(client)/booking/date.tsx — Odabir datuma
- Header: "Odaberi datum" with back button
- Full month calendar view
- Sundays greyed out, not selectable
- Blocked days greyed out with dot indicator
- Past dates greyed out
- Today: gold border
- Selected date: gold fill
- "Dalje" button active only when date selected → navigates to service screen with date param

### app/(client)/booking/service.tsx — Odabir usluge
- Header: "Odaberi uslugu", selected date as subtitle
- Services in three sections: KOSA, BRADA, PAKETI
- Each card: name (in active language), duration in minutes, price in KM
- Dimmed services with red "Nema termina" if no slots available that day
- If zero services available: friendly message + "Provjeri drugi dan" button
- Gold border on selected card
- "Dalje" active only when service selected

### app/(client)/booking/time.tsx — Odabir termina
- Header: "Odaberi termin", date and service as subtitle
- Grid of time slots from slotCalculator.ts
- Each slot: tappable card showing time e.g. "09:00"
- Selected slot: gold highlight
- Empty state if no slots: suggest another day
- "Dalje" active only when slot selected

### app/(client)/booking/confirm.tsx — Potvrda rezervacije
- Header: "Potvrdi rezervaciju"
- Summary card: service name, date in Bosnian format, time, duration, price in KM, client name and phone
- Gold "POTVRDI REZERVACIJU" button
- On confirm: add to store, show success toast, navigate to Termini
- "Nazad" outlined button

### app/(client)/termini.tsx — Termini
- Header image, "Termini" title
- Two tabs: "Budući" (gold, active) and "Historija" (secondary, minimal)
- Budući: upcoming appointments from store sorted by date
- Each card: service name, date, time, price, status badge, "Otkaži" button with confirmation alert
- Historija: minimal past appointments list, no actions
- Empty states with friendly messages

### app/(client)/notifikacije.tsx — Notifikacije
- Header image, "Notifikacije" title
- Two tabs: "Nepročitano" and "Arhiva"
- Mock notifications: booking confirmation, appointment reminder, barber holiday announcement
- Each card: icon, title, message, time ago
- Tapping marks as read, moves to Arhiva
- Empty state: "Pročitali ste sve obavijesti — Čestitamo, držite sve konce u rukama!"

### app/(client)/postavke.tsx — Postavke
- Header image, "Postavke" title
- Options list with icons and arrows:
  - Korisnički profil → edit modal (name, phone)
  - Obavijesti → toggle switch
  - Jezik / Language → cycles BA/EN, updates entire app instantly
  - O aplikaciji → version 1.0.0, Instagram links
  - Odjavi me → confirmation alert → clear AsyncStorage → clear store → navigate to onboarding

---

## Screens — Barber Side

### app/(barber)/pin.tsx — Barber PIN
- Full dark screen, "Barber pristup" title
- 6 large digit PIN input circles
- Number pad below
- Mock PIN: 123456
- Correct PIN: set barberAuthenticated in store, navigate to barber dashboard
- Wrong PIN: shake animation + "Pogrešan PIN" in red
- Back button to client home

### app/(barber)/dashboard.tsx — Barber Dashboard
- Today's date prominent at top, day name
- Summary row: total appointments today, confirmed count, expected earnings in KM — gold accent cards
- Appointment list for today in time order
- Each card: time prominent, client name, phone, service name, duration, status badge
- "Potvrdi" (gold) and "Otkaži" (outlined red) buttons — confirmation alert before cancel — update store instantly
- Empty state if no appointments today
- Barber bottom navigation: Dashboard, Kalendar, Rezervacije, Usluge, Postavke

### app/(barber)/kalendar.tsx — Barber Kalendar
- Monthly calendar view
- Each day cell: gold appointment count badge
- Blocked days: red overlay with "Slobodno" label
- Tapping day: bottom sheet with that day's appointments
- "Blokiraj dan" button in bottom sheet → confirmation alert → adds to blocked in store
- "Odblokiraj" if day already blocked

### app/(barber)/rezervacije.tsx — Barber Rezervacije
- Full appointment list sorted by date and time
- Filter row: Sve / Potvrđeno / Na čekanju / Otkazano
- Each card: full details + cancel button with confirmation alert
- Floating "+" button → modal form: client name, phone, service dropdown, date, time → adds to store

### app/(barber)/usluge.tsx — Barber Usluge
- Services grouped by KOSA / BRADA / PAKETI
- Each card: name, duration, price, active/inactive toggle
- "Uredi" button → bottom sheet modal with editable fields → saves to store
- "Dodaj uslugu" button → add modal → adds to store

### app/(barber)/postavke.tsx — Barber Postavke
- Working hours edit (open/close time)
- Working days checkboxes Mon-Sun
- Promjena PIN-a: current PIN, new PIN twice, save to store
- Push notification preferences toggle
- "Odjavi se iz barber moda" → confirmation alert → clears barberAuthenticated → client home

---

## Additional Requirements

- Zero backend, zero API calls, zero Supabase in this phase
- Persistent auth via AsyncStorage — user stays logged in between sessions
- All other state in Zustand only
- Every destructive action (cancel, logout, block day) requires confirmation alert before executing
- Android back button works correctly on every screen
- All forms use React Hook Form with validation
- All date formatting uses date-fns 2.x with Bosnian locale
- SafeAreaView on every single screen without exception
- No hardcoded color values — always use constants from /constants/colors.ts
- No hardcoded font values — always use constants from /constants/typography.ts
- All currency displayed as KM not BAM
- Phone numbers in Bosnian format: 062 906 329
- Logo placeholder: circular gold border with "C" in center, used everywhere
- App must look and feel complete and professional
- README.md explaining structure, how to run, and what to replace when backend is added

---

## What Has Been Built So Far

- ✅ /constants/colors.ts
- ✅ /constants/typography.ts
- ✅ /lib/mockData.ts
- ✅ /lib/slotCalculator.ts
- ✅ /lib/i18n.ts
- ✅ /locales/bs.ts
- ✅ /locales/en.ts
- ✅ /store/useAppStore.ts
- ✅ /components/common/Button.tsx
- ✅ /components/common/Card.tsx
- ✅ /components/common/Badge.tsx
- ✅ /components/common/Header.tsx
- ✅ /components/common/EmptyState.tsx
- ✅ /components/common/LoadingSpinner.tsx
- ✅ /components/common/ScreenHeader.tsx
- ✅ /app/_layout.tsx
- ✅ /app/index.tsx (Onboarding — working, language toggle working)
- ✅ /app/(auth)/_layout.tsx
- ✅ /app/(auth)/login.tsx — needs update per auth system above
- ✅ /app/(auth)/register.tsx — needs update per auth system above
