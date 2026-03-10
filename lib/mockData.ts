import { addDays, format } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ServiceCategory = 'kosa' | 'brada' | 'paketi';
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Service {
  id: string;
  nameBS: string;
  nameEN: string;
  category: ServiceCategory;
  price: number;
  duration: number; // minutes
  active: boolean;
  description?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  date: string; // 'yyyy-MM-dd'
  time: string; // 'HH:mm'
  status: AppointmentStatus;
  createdAt: string; // ISO string
}

export interface BlockedDay {
  id: string;
  date: string; // 'yyyy-MM-dd'
  reason: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking_confirmation' | 'reminder' | 'announcement';
  read: boolean;
  createdAt: string; // ISO string
}

export interface MockUser {
  name: string;
  phone: string;
  isLoggedIn: boolean;
}

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  instagram: string;
  coordinates: { latitude: number; longitude: number };
  workingDays: number[]; // 1=Mon … 6=Sat (0=Sun closed)
  openTime: string; // 'HH:mm'
  closeTime: string; // 'HH:mm'
  bufferMinutes: number;
}

// ─── Shop Info ────────────────────────────────────────────────────────────────

export const SHOP_INFO: ShopInfo = {
  name: 'Frizerski salon Chersa',
  address: 'Bosanska 103, Travnik',
  phone: '062906329',
  instagram: 'frizerski_salon_chersa',
  coordinates: { latitude: 44.2269016, longitude: 17.6623864 },
  workingDays: [1, 2, 3, 4, 5, 6], // Mon–Sat
  openTime: '09:00',
  closeTime: '18:00',
  bufferMinutes: 5,
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const MOCK_SERVICES: Service[] = [
  // KOSA
  {
    id: 's1',
    nameBS: 'Šišanje',
    nameEN: 'Haircut',
    category: 'kosa',
    price: 10,
    duration: 20,
    active: true,
  },
  {
    id: 's2',
    nameBS: 'Šišanje za djecu (do 12 godina)',
    nameEN: "Children's haircut",
    category: 'kosa',
    price: 8,
    duration: 15,
    active: true,
  },
  {
    id: 's3',
    nameBS: 'Šišanje na kratko (na nulu, na keca)',
    nameEN: 'Short haircut',
    category: 'kosa',
    price: 8,
    duration: 15,
    active: true,
  },
  {
    id: 's4',
    nameBS: 'Pranje i feniranje kose',
    nameEN: 'Hair wash and blowdry',
    category: 'kosa',
    price: 3,
    duration: 10,
    active: true,
  },
  // BRADA
  {
    id: 's5',
    nameBS: 'Skraćivanje brade',
    nameEN: 'Beard trim',
    category: 'brada',
    price: 2,
    duration: 10,
    active: true,
  },
  {
    id: 's6',
    nameBS: 'Skraćivanje i oblikovanje brade mašinom',
    nameEN: 'Beard trim and shape (machine)',
    category: 'brada',
    price: 3,
    duration: 10,
    active: true,
  },
  {
    id: 's7',
    nameBS: 'Skraćivanje brade i oblikovanje britvom',
    nameEN: 'Beard trim and shape (razor)',
    category: 'brada',
    price: 5,
    duration: 15,
    active: true,
  },
  {
    id: 's8',
    nameBS: 'DELUXE brada',
    nameEN: 'DELUXE beard',
    category: 'brada',
    price: 8,
    duration: 20,
    active: true,
  },
  // PAKETI
  {
    id: 's9',
    nameBS: 'Full paket',
    nameEN: 'Full package',
    category: 'paketi',
    price: 20,
    duration: 45,
    active: true,
    description:
      'Šišanje, skraćivanje i oblikovanje brade, pranje i feniranje, styling',
  },
  {
    id: 's10',
    nameBS: 'DELUXE paket',
    nameEN: 'DELUXE package',
    category: 'paketi',
    price: 25,
    duration: 50,
    active: true,
    description: 'Šišanje, DELUXE brada, pranje i feniranje 2x, styling',
  },
];

// ─── Date helpers (relative to today so mock data always looks current) ──────

const d = (offset: number): string =>
  format(addDays(new Date(), offset), 'yyyy-MM-dd');

const iso = (offset: number): string =>
  addDays(new Date(), offset).toISOString();

// ─── Mock Appointments ────────────────────────────────────────────────────────
// 10 appointments spread across today (+0) and the next 5 working days.
// Today = Saturday; +2 = Monday; +3 = Tuesday; +4 = Wednesday; +5 = Thursday.

export const MOCK_APPOINTMENTS: Appointment[] = [];

// ─── Blocked Days ─────────────────────────────────────────────────────────────
// One day next week blocked (Monday, +9 days from today)

export const MOCK_BLOCKED_DAYS: BlockedDay[] = [
  {
    id: 'b1',
    date: d(9), // Monday next week
    reason: 'Slobodan dan',
  },
];

// ─── Mock User ────────────────────────────────────────────────────────────────

export const MOCK_USER: MockUser = {
  name: 'Nedim Kurtović',
  phone: '+38762156059',
  isLoggedIn: false,
};

// ─── Mock Notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Rezervacija potvrđena',
    message: 'Tvoja rezervacija za Šišanje je potvrđena. Vidimo se uskoro!',
    type: 'booking_confirmation',
    read: false,
    createdAt: iso(-1),
  },
  {
    id: 'n2',
    title: 'Podsjetnik',
    message: 'Sutra imaš termin u 09:00. Ne zaboravi!',
    type: 'reminder',
    read: false,
    createdAt: iso(0),
  },
  {
    id: 'n3',
    title: 'Obavijest salona',
    message:
      'Salon će biti zatvoren narednog ponedjeljka. Slobodan dan za šefa. Zakaži ranije!',
    type: 'announcement',
    read: true,
    createdAt: iso(-3),
  },
];
