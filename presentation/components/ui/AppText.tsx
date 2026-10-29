import { Text, TextProps } from "react-native";
import { ColorName, colors, typography, TypographyVariant } from "../../theme";

interface Props extends TextProps {
    variant?: TypographyVariant;
    color?: ColorName;
    align?: 'left' | 'center' | 'right';
}

// Todo texto de la app pasa por aquí para que siempre lleve la fuente y el color del tema
export default function AppText({ variant = 'body', color = 'text', align, style, ...props }: Props) {
    return (
        <Text
            style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, style]}
            maxFontSizeMultiplier={1.4}
            {...props}
        />
    );
}
