import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";

interface Props {
    value: string;
    onChangeText: (value: string) => void;
    // 6 para recuperar la contraseña, 4 para el código de entrega
    length: number;
    label?: string;
    error?: string | null;
    autoFocus?: boolean;
}

// Código de verificación en casillas. Un solo campo invisible encima recibe el teclado y el pegado,
// así el código que llega por correo se puede pegar entero
export default function CodeInput({ value, onChangeText, length, label, error, autoFocus }: Props) {
    const [focused, setFocused] = useState(false);
    const digits = value.split('');

    return (
        <View style={styles.container}>
            {label && <AppText variant="smallStrong">{label}</AppText>}
            <View>
                <View style={styles.boxes}>
                    {Array.from({ length }, (_, index) => {
                        const isCurrent = focused && index === Math.min(digits.length, length - 1);
                        return (
                            <View
                                key={index}
                                style={[styles.box, isCurrent && styles.boxCurrent, !!error && styles.boxError]}
                            >
                                <AppText variant="price">{digits[index] ?? ''}</AppText>
                            </View>
                        );
                    })}
                </View>
                <TextInput
                    value={value}
                    onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, length))}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={length}
                    autoFocus={autoFocus}
                    caretHidden
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    accessibilityLabel={`${label ?? 'Código'} de ${length} dígitos`}
                    style={styles.hiddenInput}
                />
            </View>
            {error && <AppText variant="caption" color="danger">{error}</AppText>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    boxes: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    box: {
        flex: 1,
        height: 64,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        backgroundColor: colors.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxCurrent: {
        borderColor: colors.asphalt,
    },
    boxError: {
        borderColor: colors.danger,
    },
    // Ocupa el área de las casillas para que tocar cualquiera abra el teclado. Invisible con opacidad:
    // Android ignora el color transparente en el texto, y un campo con opacidad 0 sigue recibiendo toques
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0,
    },
});
