import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius, spacing, touchTarget } from "../../theme";
import AppText from "./AppText";

interface Props extends TextInputProps {
    label?: string;
    hint?: string;
    error?: string | null;
    icon?: keyof typeof Ionicons.glyphMap;
    // dark: sobre fondo asfalto (inicio de sesión)
    tone?: 'light' | 'dark';
}

// Campo con etiqueta arriba y ayuda o error abajo. Con secureTextEntry agrega el ojo para ver la contraseña
const TextField = forwardRef<TextInput, Props>(function TextField(
    { label, hint, error, icon, tone = 'light', secureTextEntry, editable = true, style, ...inputProps }, ref) {
    const [focused, setFocused] = useState(false);
    const [hidden, setHidden] = useState(true);
    const dark = tone === 'dark';
    const textColor = dark ? colors.textOnDark : colors.text;
    const mutedColor = dark ? colors.textOnDarkMuted : colors.textMuted;

    return (
        <View style={styles.container}>
            {label && <AppText variant="smallStrong" style={{ color: dark ? colors.textOnDark : colors.text }}>{label}</AppText>}
            <View style={[
                styles.box,
                { backgroundColor: dark ? colors.fieldOnDark : colors.surfaceMuted },
                focused && { borderColor: dark ? colors.cargo : colors.asphalt },
                !!error && { borderColor: dark ? colors.dangerOnDark : colors.danger },
                !editable && styles.disabled,
            ]}>
                {icon && <Ionicons name={icon} size={20} color={mutedColor} />}
                <TextInput
                    ref={ref}
                    placeholderTextColor={mutedColor}
                    selectionColor={dark ? colors.cargo : colors.asphalt}
                    accessibilityLabel={label ?? inputProps.placeholder}
                    maxFontSizeMultiplier={1.4}
                    {...inputProps}
                    style={[styles.input, { color: textColor }, style]}
                    secureTextEntry={secureTextEntry && hidden}
                    editable={editable}
                    onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
                />
                {secureTextEntry &&
                    <Pressable onPress={() => setHidden(!hidden)} hitSlop={12} accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}>
                        <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={mutedColor} />
                    </Pressable>
                }
            </View>
            {error
                ? <AppText variant="caption" style={{ color: dark ? colors.dangerOnDark : colors.danger }}>{error}</AppText>
                : hint ? <AppText variant="caption" style={{ color: mutedColor }}>{hint}</AppText> : null}
        </View>
    );
});

export default TextField;

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: touchTarget + 4,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        fontFamily: fonts.regular,
        fontSize: 16,
        paddingVertical: spacing.sm,
    },
    disabled: {
        opacity: 0.6,
    },
});
