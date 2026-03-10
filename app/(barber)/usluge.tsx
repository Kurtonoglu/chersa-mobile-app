import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize } from '../../constants/typography';
import { t } from '../../lib/i18n';
import { useAppStore } from '../../store/useAppStore';
import { Service, ServiceCategory } from '../../lib/mockData';

// ── Service edit / add modal ───────────────────────────────────────────────────

interface ServiceFormData {
  nameBS: string;
  nameEN: string;
  price: string;
  duration: string;
  category: ServiceCategory;
  active: boolean;
}

const DEFAULT_FORM: ServiceFormData = {
  nameBS: '',
  nameEN: '',
  price: '',
  duration: '',
  category: 'kosa',
  active: true,
};

const CATEGORIES: { key: ServiceCategory; label: string }[] = [
  { key: 'kosa', label: 'client.booking.categories.kosa' },
  { key: 'brada', label: 'client.booking.categories.brada' },
  { key: 'paketi', label: 'client.booking.categories.paketi' },
];

interface ServiceModalProps {
  visible: boolean;
  title: string;
  initial: ServiceFormData;
  onClose: () => void;
  onSave: (data: ServiceFormData) => void;
}

function ServiceModal({ visible, title, initial, onClose, onSave }: ServiceModalProps) {
  const [form, setForm] = useState<ServiceFormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync when initial changes (i.e. different service selected for edit)
  React.useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial, visible]);

  const set = (key: keyof ServiceFormData, value: string | boolean | ServiceCategory) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nameBS.trim()) e.nameBS = 'Naziv (BS) je obavezan.';
    if (!form.nameEN.trim()) e.nameEN = 'Name (EN) is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Unesi ispravnu cijenu.';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      e.duration = 'Unesi ispravno trajanje.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
          {/* Header */}
          <View style={sm.header}>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={sm.title}>{title}</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={sm.body} keyboardShouldPersistTaps="handled">
            {/* Name BS */}
            <Text style={sm.label}>{t('barber.usluge.nameBS')}</Text>
            <TextInput
              style={[sm.input, errors.nameBS ? sm.inputError : null]}
              value={form.nameBS}
              onChangeText={(v) => set('nameBS', v)}
              placeholder="Npr. Šišanje"
              placeholderTextColor={Colors.textSecondary}
            />
            {errors.nameBS ? <Text style={sm.error}>{errors.nameBS}</Text> : null}

            {/* Name EN */}
            <Text style={sm.label}>{t('barber.usluge.nameEN')}</Text>
            <TextInput
              style={[sm.input, errors.nameEN ? sm.inputError : null]}
              value={form.nameEN}
              onChangeText={(v) => set('nameEN', v)}
              placeholder="e.g. Haircut"
              placeholderTextColor={Colors.textSecondary}
            />
            {errors.nameEN ? <Text style={sm.error}>{errors.nameEN}</Text> : null}

            {/* Price */}
            <Text style={sm.label}>{t('barber.usluge.price')} ({t('common.currency')})</Text>
            <TextInput
              style={[sm.input, errors.price ? sm.inputError : null]}
              value={form.price}
              onChangeText={(v) => set('price', v)}
              placeholder="10"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.price ? <Text style={sm.error}>{errors.price}</Text> : null}

            {/* Duration */}
            <Text style={sm.label}>{t('barber.usluge.duration')} ({t('common.minutes')})</Text>
            <TextInput
              style={[sm.input, errors.duration ? sm.inputError : null]}
              value={form.duration}
              onChangeText={(v) => set('duration', v)}
              placeholder="20"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />
            {errors.duration ? <Text style={sm.error}>{errors.duration}</Text> : null}

            {/* Category */}
            <Text style={sm.label}>{t('barber.usluge.category')}</Text>
            <View style={sm.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    sm.categoryChip,
                    form.category === cat.key && sm.categoryChipActive,
                  ]}
                  onPress={() => set('category', cat.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      sm.categoryChipText,
                      form.category === cat.key && sm.categoryChipTextActive,
                    ]}
                  >
                    {t(cat.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Active toggle */}
            <View style={sm.toggleRow}>
              <Text style={sm.toggleLabel}>
                {form.active ? t('barber.usluge.active') : t('barber.usluge.inactive')}
              </Text>
              <Switch
                value={form.active}
                onValueChange={(v) => set('active', v)}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.background}
                ios_backgroundColor={Colors.border}
              />
            </View>
          </ScrollView>

          {/* Save */}
          <View style={sm.footer}>
            <TouchableOpacity style={sm.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={sm.saveBtnText}>{t('barber.usluge.saveBtn')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sm = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    color: Colors.textPrimary,
    fontSize: FontSize.base,
  },
  inputError: { borderColor: Colors.error },
  error: {
    color: Colors.error,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  categoryChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  categoryChipTextActive: { color: Colors.background },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingVertical: 8,
  },
  toggleLabel: {
    color: Colors.textPrimary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    height: 52,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});

// ── Service card ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: Service;
  onToggle: () => void;
  onEdit: () => void;
}

function ServiceCard({ service, onToggle, onEdit }: ServiceCardProps) {
  return (
    <View style={[svc.container, !service.active && svc.containerInactive]}>
      <View style={svc.left}>
        <Text style={[svc.name, !service.active && svc.nameInactive]}>
          {service.nameBS}
        </Text>
        <Text style={svc.meta}>
          {service.duration} {t('common.minutes')} · {service.price} {t('common.currency')}
        </Text>
      </View>

      <View style={svc.right}>
        {/* Edit button */}
        <TouchableOpacity
          style={svc.editBtn}
          onPress={onEdit}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Ionicons name="pencil-outline" size={15} color={Colors.accent} />
          <Text style={svc.editBtnText}>{t('barber.usluge.editBtn')}</Text>
        </TouchableOpacity>

        {/* Active toggle */}
        <Switch
          value={service.active}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.accent }}
          thumbColor={Colors.background}
          ios_backgroundColor={Colors.border}
          style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
        />
      </View>
    </View>
  );
}

const svc = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 56,
  },
  containerInactive: {
    opacity: 0.5,
  },
  left: { flex: 1 },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameInactive: { color: Colors.textSecondary },
  meta: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${Colors.accent}14`,
  },
  editBtnText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.text}>{title}</Text>
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  text: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function UslugeScreen() {
  const language = useAppStore((s) => s.language);
  const services = useAppStore((s) => s.services);
  const toggleServiceActive = useAppStore((s) => s.toggleServiceActive);
  const updateService = useAppStore((s) => s.updateService);
  const addService = useAppStore((s) => s.addService);

  void language;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);

  const grouped: Record<ServiceCategory, Service[]> = {
    kosa: services.filter((s) => s.category === 'kosa'),
    brada: services.filter((s) => s.category === 'brada'),
    paketi: services.filter((s) => s.category === 'paketi'),
  };

  const handleEdit = (service: Service) => {
    setEditTarget(service);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (data: ServiceFormData) => {
    if (!editTarget) return;
    updateService(editTarget.id, {
      nameBS: data.nameBS,
      nameEN: data.nameEN,
      price: Number(data.price),
      duration: Number(data.duration),
      category: data.category,
      active: data.active,
    });
    setEditModalVisible(false);
    setEditTarget(null);
  };

  const handleAdd = (data: ServiceFormData) => {
    addService({
      nameBS: data.nameBS,
      nameEN: data.nameEN,
      price: Number(data.price),
      duration: Number(data.duration),
      category: data.category,
      active: data.active,
    });
    setAddModalVisible(false);
  };

  const editInitial: ServiceFormData = editTarget
    ? {
        nameBS: editTarget.nameBS,
        nameEN: editTarget.nameEN,
        price: String(editTarget.price),
        duration: String(editTarget.duration),
        category: editTarget.category,
        active: editTarget.active,
      }
    : DEFAULT_FORM;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{t('barber.usluge.title')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={Colors.background} />
          <Text style={styles.addBtnText}>{t('barber.usluge.addBtn')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* KOSA */}
        <SectionHeader title={t('client.booking.categories.kosa')} />
        <View style={styles.card}>
          {grouped.kosa.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onToggle={() => toggleServiceActive(s.id)}
              onEdit={() => handleEdit(s)}
            />
          ))}
        </View>

        {/* BRADA */}
        <SectionHeader title={t('client.booking.categories.brada')} />
        <View style={styles.card}>
          {grouped.brada.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onToggle={() => toggleServiceActive(s.id)}
              onEdit={() => handleEdit(s)}
            />
          ))}
        </View>

        {/* PAKETI */}
        <SectionHeader title={t('client.booking.categories.paketi')} />
        <View style={styles.card}>
          {grouped.paketi.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onToggle={() => toggleServiceActive(s.id)}
              onEdit={() => handleEdit(s)}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Edit modal ─────────────────────────────────────────── */}
      <ServiceModal
        visible={editModalVisible}
        title={t('barber.usluge.editTitle')}
        initial={editInitial}
        onClose={() => {
          setEditModalVisible(false);
          setEditTarget(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* ── Add modal ──────────────────────────────────────────── */}
      <ServiceModal
        visible={addModalVisible}
        title={t('barber.usluge.addTitle')}
        initial={DEFAULT_FORM}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAdd}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.accent,
  },
  addBtnText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  bottomSpacer: { height: 40 },
});
