import { TextStyle } from "react-native";
import {
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
} from "@expo-google-fonts/barlow";
import {
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
} from "@expo-google-fonts/barlow-condensed";

// Archivos de fuente que App carga al arrancar
export const fontAssets = {
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
};

// En Android una fuente propia no acepta fontWeight: el grosor va en el nombre de la familia
export const fonts = {
    regular: 'Barlow_400Regular',
    medium: 'Barlow_500Medium',
    semibold: 'Barlow_600SemiBold',
    bold: 'Barlow_700Bold',
    display: 'BarlowCondensed_700Bold',
    displayHeavy: 'BarlowCondensed_800ExtraBold',
} as const;

// Barlow Condensed (tipo placa) para títulos y precios; Barlow para leer
export const typography = {
    brand: { fontFamily: fonts.displayHeavy, fontSize: 40, lineHeight: 44, letterSpacing: 0.5 },
    display: { fontFamily: fonts.displayHeavy, fontSize: 32, lineHeight: 36 },
    title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
    heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
    body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
    bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
    small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },
    smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19 },
    caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
    label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
    button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
    price: { fontFamily: fonts.displayHeavy, fontSize: 24, lineHeight: 28, fontVariant: ['tabular-nums'] },
    priceLarge: { fontFamily: fonts.displayHeavy, fontSize: 36, lineHeight: 40, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
