import { ViewStyle } from "react-native";
import { colors } from "./colors";

// Escala de espacios: los márgenes y rellenos salen de aquí
export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
} as const;

// Alto mínimo de cualquier cosa que se toca (accesibilidad: 48 dp en Android)
export const touchTarget = 48;

export const shadows = {
    card: {
        elevation: 2,
        shadowColor: colors.asphalt,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    sheet: {
        elevation: 12,
        shadowColor: colors.asphalt,
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: -4 },
    },
} satisfies Record<string, ViewStyle>;
