import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  startOfMonth,
  addMonths,
  subMonths,
  getDay,
  getDaysInMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  parseISO,
} from 'date-fns';
import { Colors } from '../../../constants/colors';
import { FontSize } from '../../../constants/typography';
import { t } from '../../../lib/i18n';
import { useAppStore } from '../../../store/useAppStore';

// ── Bosnian locale strings ───────────────────────────────────────────────────

const BS_MONTHS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];

// Mon–Sun (European week order)
const DAY_HEADERS = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = 24;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - H_PAD * 2) / 7);

/** Convert getDay() (Sun=0) to Mon-based index (Mon=0 … Sun=6) */
const monBasedIndex = (date: Date) => (getDay(date) + 6) % 7;

// ── Screen ───────────────────────────────────────────────────────────────────

export default function BookingDateScreen() {
  const router = useRouter();
  useAppStore((s) => s.language); // re-render on language change
  const blockedDays = useAppStore((s) => s.blockedDays);

  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const canGoPrev = !isSameMonth(currentMonth, today);

  const monthLabel = `${BS_MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  // Build calendar cells: null = empty padding, number = day-of-month
  const cells = useMemo<(number | null)[]>(() => {
    const firstDay = startOfMonth(currentMonth);
    const offset = monBasedIndex(firstDay);
    const days = getDaysInMonth(currentMonth);
    return [
      ...Array<null>(offset).fill(null),
      ...Array.from({ length: days }, (_, i) => i + 1),
    ];
  }, [currentMonth]);

  const getCellDate = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

  const getDayState = (day: number) => {
    const cellDate = getCellDate(day);
    const dateStr = format(cellDate, 'yyyy-MM-dd');
    const isPast = isBefore(cellDate, today);
    const isSunday = getDay(cellDate) === 0;
    const isBlocked = blockedDays.some((b) => b.date === dateStr);
    const isTodayCell = isSameDay(cellDate, today);
    const isSelected = dateStr === selectedDate;
    const isDisabled = isPast || isSunday || isBlocked;
    return { isPast, isSunday, isBlocked, isTodayCell, isSelected, isDisabled, dateStr };
  };

  const handleDayPress = (day: number) => {
    const { isDisabled, dateStr } = getDayState(day);
    if (isDisabled) return;
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  };

  // Chunk cells into rows of 7
  const rows = useMemo<(number | null)[][]>(() => {
    const out: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      out.push(cells.slice(i, i + 7));
    }
    return out;
  }, [cells]);

  const handleNext = () => {
    if (!selectedDate) return;
    router.push({
      pathname: '/(client)/booking/service',
      params: { date: selectedDate },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Screen header ─────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{t('client.booking.selectDate')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Month navigation ──────────────────────────────────── */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
            onPress={() => canGoPrev && setCurrentMonth((m) => subMonths(m, 1))}
            activeOpacity={canGoPrev ? 0.7 : 1}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={canGoPrev ? Colors.textPrimary : Colors.border}
            />
          </TouchableOpacity>

          <Text style={styles.monthLabel}>{monthLabel}</Text>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Day-of-week headers ───────────────────────────────── */}
        <View style={styles.dayHeaderRow}>
          {DAY_HEADERS.map((label, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={[styles.dayHeaderText, i === 6 && styles.sundayHeaderText]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Calendar grid ─────────────────────────────────────── */}
        <View style={styles.calendarGrid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.calendarRow}>
              {row.map((day, colIdx) => {
                if (day === null) {
                  return <View key={`blank-${rowIdx}-${colIdx}`} style={styles.cell} />;
                }
                const { isSunday, isBlocked, isTodayCell, isSelected, isDisabled } =
                  getDayState(day);

                return (
                  <TouchableOpacity
                    key={`day-${day}-${rowIdx}`}
                    style={[
                      styles.cell,
                      styles.dayCell,
                      isTodayCell && !isSelected && styles.todayCell,
                      isSelected && styles.selectedCell,
                      isDisabled && styles.disabledCell,
                    ]}
                    onPress={() => handleDayPress(day)}
                    activeOpacity={isDisabled ? 1 : 0.75}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isDisabled && styles.disabledDayText,
                        isTodayCell && !isSelected && styles.todayDayText,
                      ]}
                    >
                      {day}
                    </Text>
                    {/* Blocked day indicator dot */}
                    {isBlocked && <View style={styles.blockedDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Danas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
            <Text style={styles.legendText}>Blokirano / Nedjelja</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Footer: Dalje button ──────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedDate && styles.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!selectedDate}
        >
          <Text style={[styles.nextBtnText, !selectedDate && styles.nextBtnTextDisabled]}>
            {t('common.next')}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={selectedDate ? Colors.background : Colors.textSecondary}
            style={styles.nextBtnIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Screen header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
  },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 40,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: H_PAD, paddingBottom: 24 },

  // ── Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Day headers
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayHeaderCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayHeaderText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sundayHeaderText: {
    color: Colors.error,
    opacity: 0.6,
  },

  // ── Calendar grid
  calendarGrid: {},
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderRadius: CELL_SIZE / 2,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  selectedCell: {
    backgroundColor: Colors.accent,
  },
  disabledCell: {
    opacity: 0.3,
  },
  dayText: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  todayDayText: {
    color: Colors.accent,
    fontWeight: '700',
  },
  selectedDayText: {
    color: Colors.background,
    fontWeight: '700',
  },
  disabledDayText: {
    color: Colors.textSecondary,
  },
  blockedDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.error,
  },

  // ── Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },

  // ── Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    height: 54,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  nextBtnIcon: {
    marginLeft: 8,
  },
});
