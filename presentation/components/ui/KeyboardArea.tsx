import { useEffect, useState } from "react";
import { Keyboard, Platform, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends ViewProps {
    // El área ya está por encima de la barra de gestos (dentro de un SafeAreaView con borde inferior)
    aboveBottomInset?: boolean;
}

// Deja libre el espacio del teclado para que los campos y los botones de abajo no queden tapados.
// Reemplaza a KeyboardAvoidingView: en Android, al cerrarse el teclado este informa una posición sin contar
// la barra de navegación y el contenido quedaba subido con un espacio de más
export default function KeyboardArea({ aboveBottomInset = false, style, children, ...props }: Props) {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const show = Keyboard.addListener(showEvent, (event) => setKeyboardHeight(event.endCoordinates.height));
        const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const space = Math.max(0, keyboardHeight - (aboveBottomInset ? insets.bottom : 0));
    return <View style={[style, { paddingBottom: space }]} {...props}>{children}</View>;
}
