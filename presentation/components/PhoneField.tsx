import { forwardRef, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppText, TextField } from "./ui";
import { colors, radius, spacing, touchTarget } from "../theme";
import { useKnownCountries } from "../hooks/useCountries";
import { countryFlag, countryName } from "../utils/Countries";
import { currentLanguage } from "../../i18n";

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    // País del indicativo (CO, FR...). Con él cambia el país de la cuenta
    countryCode: string;
    onChangeCountry: (code: string) => void;
}

// Celular con el indicativo de su país: se toca la bandera para elegir otro. Mientras la lista de países no llega
// (sin internet al abrir la app) queda el +57 de siempre, sin poder cambiarlo
const PhoneField = forwardRef<TextInput, Props>(function PhoneField({ countryCode, onChangeCountry, ...fieldProps }, ref) {
    const { t } = useTranslation();
    const countries = useKnownCountries();
    const [picking, setPicking] = useState(false);
    const selected = countries.find((country) => country.code === countryCode);
    const sorted = useMemo(
        () => [...countries].sort((a, b) => countryName(a).localeCompare(countryName(b), currentLanguage())),
        [countries, currentLanguage()],
    );

    const prefix = selected ? `${countryFlag(selected.code)} ${selected.phone_prefix}` : '+57';

    return (
        <>
            <TextField
                ref={ref}
                {...fieldProps}
                placeholder={selected?.phone_example ?? fieldProps.placeholder}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={selected && selected.code !== 'CO' ? 15 : 13}
                leading={countries.length > 0
                    ? <Pressable
                        onPress={() => setPicking(true)}
                        hitSlop={8}
                        style={styles.prefix}
                        accessibilityRole="button"
                        accessibilityLabel={t('phoneField.cambiarIndicativo', { country: selected ? countryName(selected) : '' })}
                    >
                        <AppText variant="bodyStrong">{prefix}</AppText>
                        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </Pressable>
                    : <AppText variant="bodyStrong">{prefix}</AppText>}
            />
            <Modal visible={picking} transparent animationType="fade" onRequestClose={() => setPicking(false)} statusBarTranslucent>
                <Pressable style={styles.backdrop} onPress={() => setPicking(false)} accessibilityLabel={t('common.cerrar')}>
                    <Pressable style={styles.sheet} accessibilityViewIsModal>
                        <AppText variant="title">{t('phoneField.eligeTuPais')}</AppText>
                        <FlatList
                            data={sorted}
                            keyExtractor={(country) => country.code}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => { onChangeCountry(item.code); setPicking(false); }}
                                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: item.code === countryCode }}
                                >
                                    <AppText variant="body">{countryFlag(item.code)}</AppText>
                                    <AppText variant="body" style={styles.flex}>{countryName(item)}</AppText>
                                    <AppText variant="bodyStrong" color="textMuted">{item.phone_prefix}</AppText>
                                    {item.code === countryCode && <Ionicons name="checkmark" size={20} color={colors.success} />}
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
});

export default PhoneField;

const styles = StyleSheet.create({
    prefix: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: touchTarget,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '75%',
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
    },
    rowPressed: {
        backgroundColor: colors.surfaceMuted,
    },
    flex: {
        flex: 1,
    },
});
