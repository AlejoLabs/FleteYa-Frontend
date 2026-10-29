import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "../../theme";
import AppText from "./AppText";

export type ToastTone = 'info' | 'success' | 'error';

interface ToastMessage {
    id: number;
    message: string;
    tone: ToastTone;
}

interface ToastContextValue {
    showToast: (message: string, tone?: ToastTone) => void;
}

const DURATION_MS = 3500;

const ICONS: Record<ToastTone, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
    info: { name: 'information-circle', color: colors.textOnDark },
    success: { name: 'checkmark-circle', color: colors.successBright },
    error: { name: 'alert-circle', color: colors.dangerOnDark },
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

// Avisos que no bloquean ("Guardado", "No se pudo enviar"). Reemplazan los Alert.alert informativos;
// las preguntas que piden decidir usan ConfirmDialog
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastMessage | null>(null);
    const nextId = useRef(0);

    const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
        nextId.current += 1;
        setToast({ id: nextId.current, message, tone });
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <ToastView key={toast.id} toast={toast} onHide={() => setToast(null)} />}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

function ToastView({ toast, onHide }: { toast: ToastMessage; onHide: () => void }) {
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
        const timer = setTimeout(() => {
            Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(onHide);
        }, DURATION_MS);
        return () => clearTimeout(timer);
    }, []);

    const icon = ICONS[toast.tone];
    return (
        <View pointerEvents="none" style={[styles.wrapper, { bottom: insets.bottom + spacing.xl }]}>
            <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="assertive" accessibilityRole="alert">
                <Ionicons name={icon.name} size={20} color={icon.color} />
                <AppText variant="smallStrong" color="textOnDark" style={styles.text}>{toast.message}</AppText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        alignItems: 'center',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        maxWidth: 480,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.asphalt,
        ...shadows.card,
    },
    text: {
        flexShrink: 1,
    },
});
