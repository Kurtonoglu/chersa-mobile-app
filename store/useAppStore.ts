import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale, Locale } from '../lib/i18n';
import { supabase } from '../lib/supabase';
import * as appointmentService from '../services/appointments';

const USER_STORAGE_KEY = '@chersa:user';
import {
  MOCK_SERVICES,
  MOCK_APPOINTMENTS,
  MOCK_BLOCKED_DAYS,
  MOCK_NOTIFICATIONS,
  MOCK_USER,
  Service,
  Appointment,
  AppointmentStatus,
  BlockedDay,
  AppNotification,
} from '../lib/mockData';

// ─── State shape ──────────────────────────────────────────────────────────────

export interface CurrentUser {
  name: string;
  phone: string;
  isLoggedIn: boolean;
}

interface BookingSelection {
  date: string | null;       // 'yyyy-MM-dd'
  serviceId: string | null;
  time: string | null;       // 'HH:mm'
}

/** Payload passed to createAppointmentAsync — mirrors what confirm.tsx receives from URL params. */
export interface CreateAppointmentPayload {
  serviceId: string;
  serviceIds: string[];
  date: string;
  time: string;
  totalDuration: number;
  totalPrice: number;
}

/**
 * Async state scaffold — each slice gets its own loading + error flags.
 * Populate these from the services/ layer once backend is wired up.
 *
 * Usage pattern in a screen:
 *   const { authLoading, authError } = useAppStore(s => ({
 *     authLoading: s.authLoading, authError: s.authError
 *   }));
 */
interface AsyncState {
  /** True while loadUserFromStorage is running (initial app hydration). */
  isHydrating: boolean;

  /** True while a login / register / logout Supabase call is in-flight. */
  authLoading: boolean;
  /** Last auth error message, or null when clean. */
  authError: string | null;

  /** True while appointments are being fetched or mutated via API. */
  appointmentsLoading: boolean;
  /** Last appointments error message, or null when clean. */
  appointmentsError: string | null;

  /** True while services are being fetched or mutated via API. */
  servicesLoading: boolean;
  /** Last services error message, or null when clean. */
  servicesError: string | null;
}

interface AppState extends AsyncState {
  // ── Core state ─────────────────────────────────────────────────────────────
  currentUser: CurrentUser;
  appointments: Appointment[];
  blockedDays: BlockedDay[];
  services: Service[];
  language: Locale;
  barberAuthenticated: boolean;
  notifications: AppNotification[];
  /** Transient booking-flow selection (cleared after confirmation) */
  bookingSelection: BookingSelection;

  // ── Async state setters ─────────────────────────────────────────────────────
  /** Set auth loading/error — called by services/auth.ts */
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  /** Set appointments loading/error — called by services/appointments.ts */
  setAppointmentsLoading: (loading: boolean) => void;
  setAppointmentsError: (error: string | null) => void;
  /** Set services loading/error — called by services/appointments.ts */
  setServicesLoading: (loading: boolean) => void;
  setServicesError: (error: string | null) => void;
  /** Clear all error fields at once (e.g. when navigating away). */
  clearErrors: () => void;

  // ── Auth actions ────────────────────────────────────────────────────────────
  setUser: (user: CurrentUser) => void;
  logout: () => void;
  setHydrating: (value: boolean) => void;
  loadUserFromStorage: () => Promise<void>;

  // ── Appointment actions (sync) ──────────────────────────────────────────────
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  cancelAppointment: (id: string) => void;
  confirmAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  // ── Appointment actions (async / backend) ───────────────────────────────────
  /** Fetch the current user's appointments from Supabase and replace store state. */
  fetchAppointmentsFromBackend: () => Promise<void>;
  /** Create an appointment in Supabase, then optimistically add it to the store. */
  createAppointmentAsync: (payload: CreateAppointmentPayload) => Promise<{ ok: boolean; error?: string }>;
  /** Cancel an appointment in Supabase, then update store state to reflect it. */
  cancelAppointmentAsync: (id: string) => Promise<{ ok: boolean; error?: string }>;

  // ── Blocked day actions ─────────────────────────────────────────────────────
  blockDay: (date: string, reason?: string) => void;
  unblockDay: (date: string) => void;

  // ── Language action ─────────────────────────────────────────────────────────
  setLanguage: (lang: Locale) => void;

  // ── Barber auth ─────────────────────────────────────────────────────────────
  setBarberAuthenticated: (value: boolean) => void;

  // ── Service actions ─────────────────────────────────────────────────────────
  toggleServiceActive: (id: string) => void;
  updateService: (id: string, updates: Partial<Omit<Service, 'id'>>) => void;
  addService: (service: Omit<Service, 'id'>) => void;

  // ── Notification actions ────────────────────────────────────────────────────
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;

  // ── Booking selection ───────────────────────────────────────────────────────
  setBookingDate: (date: string | null) => void;
  setBookingService: (serviceId: string | null) => void;
  setBookingTime: (time: string | null) => void;
  clearBookingSelection: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _nextId = 1000;
const uid = (prefix: string) => `${prefix}_${Date.now()}_${++_nextId}`;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // ── Async state (initial) ───────────────────────────────────────────────────
  isHydrating: false,
  authLoading: false,
  authError: null,
  appointmentsLoading: false,
  appointmentsError: null,
  servicesLoading: false,
  servicesError: null,

  // ── Core state (initial) ────────────────────────────────────────────────────
  currentUser: { name: '', phone: '', isLoggedIn: false },
  appointments: MOCK_APPOINTMENTS,
  blockedDays: MOCK_BLOCKED_DAYS,
  services: MOCK_SERVICES,
  language: 'bs',
  barberAuthenticated: false,
  notifications: MOCK_NOTIFICATIONS,
  bookingSelection: { date: null, serviceId: null, time: null },

  // ── Async state setters ─────────────────────────────────────────────────────
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setAuthError: (error) => set({ authError: error }),
  setAppointmentsLoading: (loading) => set({ appointmentsLoading: loading }),
  setAppointmentsError: (error) => set({ appointmentsError: error }),
  setServicesLoading: (loading) => set({ servicesLoading: loading }),
  setServicesError: (error) => set({ servicesError: error }),
  clearErrors: () => set({ authError: null, appointmentsError: null, servicesError: null }),

  // ── Auth ────────────────────────────────────────────────────────────────────
  setHydrating: (value) => set({ isHydrating: value }),

  setUser: (user) => {
    set({ currentUser: user });
    AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)).catch(() => null);
  },

  logout: () => {
    set({
      currentUser: { name: '', phone: '', isLoggedIn: false },
      bookingSelection: { date: null, serviceId: null, time: null },
    });
    AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => null);
  },

  loadUserFromStorage: async () => {
    set({ isHydrating: true });
    try {
      const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (raw) {
        const user: CurrentUser = JSON.parse(raw);
        if (user.isLoggedIn) {
          set({ currentUser: user });
        }
      }
    } catch {
      // storage unavailable — stay logged out
    } finally {
      set({ isHydrating: false });
    }
  },

  // ── Appointments ────────────────────────────────────────────────────────────
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [
        ...state.appointments,
        {
          ...appointment,
          id: uid('a'),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  cancelAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'cancelled' } : apt,
      ),
    })),

  confirmAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'confirmed' } : apt,
      ),
    })),

  updateAppointmentStatus: (id, status) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status } : apt,
      ),
    })),

  // ── Async / backend appointment actions ──────────────────────────────────────

  fetchAppointmentsFromBackend: async () => {
    set({ appointmentsLoading: true, appointmentsError: null });
    const { data, error } = await appointmentService.fetchAppointments();
    if (error || !data) {
      set({ appointmentsLoading: false, appointmentsError: error ?? 'Unknown error.' });
      return;
    }
    set({ appointments: data, appointmentsLoading: false });
  },

  createAppointmentAsync: async (payload) => {
    const { currentUser } = get();
    set({ appointmentsLoading: true, appointmentsError: null });

    // Resolve user_id from the active Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ appointmentsLoading: false, appointmentsError: 'Not authenticated.' });
      return { ok: false, error: 'Not authenticated.' };
    }

    const dbPayload: appointmentService.NewDbAppointment = {
      user_id: user.id,
      client_name: currentUser.name,
      client_phone: currentUser.phone,
      primary_service_id: payload.serviceId,
      service_ids: payload.serviceIds,
      date: payload.date,
      time: payload.time,
      total_duration: payload.totalDuration,
      total_price: payload.totalPrice,
      status: 'confirmed',
    };

    const { data, error } = await appointmentService.createAppointment(dbPayload);
    if (error || !data) {
      const msg = error ?? 'Booking failed.';
      set({ appointmentsLoading: false, appointmentsError: msg });
      return { ok: false, error: msg };
    }

    // Append the new appointment to the local list optimistically
    set((state) => ({
      appointments: [...state.appointments, data],
      appointmentsLoading: false,
    }));
    return { ok: true };
  },

  cancelAppointmentAsync: async (id) => {
    set({ appointmentsLoading: true, appointmentsError: null });
    const { error } = await appointmentService.cancelAppointment(id);
    if (error) {
      set({ appointmentsLoading: false, appointmentsError: error });
      return { ok: false, error };
    }
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'cancelled' } : apt,
      ),
      appointmentsLoading: false,
    }));
    return { ok: true };
  },

  // ── Blocked days ────────────────────────────────────────────────────────────
  blockDay: (date, reason = 'Slobodan dan') =>
    set((state) => {
      // Avoid duplicate blocks
      const alreadyBlocked = state.blockedDays.some((b) => b.date === date);
      if (alreadyBlocked) return state;
      return {
        blockedDays: [
          ...state.blockedDays,
          { id: uid('b'), date, reason },
        ],
      };
    }),

  unblockDay: (date) =>
    set((state) => ({
      blockedDays: state.blockedDays.filter((b) => b.date !== date),
    })),

  // ── Language ─────────────────────────────────────────────────────────────────
  setLanguage: (lang) => {
    setLocale(lang);
    set({ language: lang });
  },

  // ── Barber auth ──────────────────────────────────────────────────────────────
  setBarberAuthenticated: (value) => set({ barberAuthenticated: value }),

  // ── Services ─────────────────────────────────────────────────────────────────
  toggleServiceActive: (id) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s,
      ),
    })),

  updateService: (id, updates) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })),

  addService: (service) =>
    set((state) => ({
      services: [
        ...state.services,
        { ...service, id: uid('s') },
      ],
    })),

  // ── Notifications ─────────────────────────────────────────────────────────────
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: uid('n'),
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    })),

  // ── Booking selection ─────────────────────────────────────────────────────────
  setBookingDate: (date) =>
    set((state) => ({
      bookingSelection: { ...state.bookingSelection, date, serviceId: null, time: null },
    })),

  setBookingService: (serviceId) =>
    set((state) => ({
      bookingSelection: { ...state.bookingSelection, serviceId, time: null },
    })),

  setBookingTime: (time) =>
    set((state) => ({
      bookingSelection: { ...state.bookingSelection, time },
    })),

  clearBookingSelection: () =>
    set({ bookingSelection: { date: null, serviceId: null, time: null } }),
}));
