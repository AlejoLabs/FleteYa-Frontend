// Paleta de FleteYa: asfalto oscuro con amarillo de carga, como las señales viales y las cintas de los camiones.
// Las pantallas usan estos nombres y nunca un color escrito a mano.
// Los colores que llevan texto encima cumplen contraste AA (4.5:1) con su texto.
export const colors = {
    // Marca
    asphalt: '#1B2430',
    asphaltRaised: '#2A3542',
    cargo: '#FFC21A',
    cargoPressed: '#E6AC00',
    cargoTint: '#FFF2CD',

    // Superficies
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF1F4',
    border: '#E1E5EA',
    borderStrong: '#C9D0D8',
    overlay: 'rgba(15, 21, 28, 0.6)',

    // Texto
    text: '#1B2430',
    textMuted: '#5F6977',
    textDisabled: '#9AA3AE',
    textOnDark: '#FFFFFF',
    textOnDarkMuted: 'rgba(255, 255, 255, 0.72)',
    fieldOnDark: 'rgba(255, 255, 255, 0.1)',
    fieldOnDarkPressed: 'rgba(255, 255, 255, 0.18)',

    // Estados (el fuerte sirve de fondo con texto blanco; el tint, de fondo con texto del mismo tono)
    success: '#17804F',
    successPressed: '#126B42',
    successBright: '#1E9E6A',
    successTint: '#EEF8F2',
    danger: '#C2362B',
    dangerTint: '#FBEAE8',
    dangerTintPressed: '#F5D5D1',
    dangerOnDark: '#FF8A7E',
    // Naranja y no amarillo, para no confundirse con los avisos de carga (cargoTint)
    warning: '#9A4A00',
    warningTint: '#FCE9D6',
    info: '#2D5BA8',
    infoTint: '#E8EEF9',

    // Detalles
    star: '#E0A100',
    pinOrigin: '#1E9E6A',
    pinDestination: '#D64535',
    google: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
