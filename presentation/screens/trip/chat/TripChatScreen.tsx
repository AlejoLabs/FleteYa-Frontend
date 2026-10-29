import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { TripChatViewModel, MAX_MESSAGE_LENGTH } from "./TripChatViewModel";
import { TripMessage } from "../../../../domain/models/TripMessage";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, KeyboardArea, Notice, StateView, useToast } from "../../../components/ui";
import { formatErrorMessage, formatTime } from "../../../utils/Formatters";
import { setOpenChat } from "../../../utils/PushNotifications";
import { colors, fonts, radius, spacing, touchTarget } from "../../../theme";

type Props = NativeStackScreenProps<TripSharedParamList, 'TripChatScreen'>;

// Chat del viaje entre el cliente y el conductor, sin compartir el celular
export function TripChatScreen({ navigation, route }: Props) {

    const { idClientRequest, otherName, readOnly } = route.params;
    const viewModel: TripChatViewModel = container.resolve('tripChatViewModel');
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    const myId = authResponse?.user.id;
    const [messages, setMessages] = useState<TripMessage[]>([]);
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isClosed, setIsClosed] = useState(Boolean(readOnly));

    const loadMessages = async () => {
        const response = await viewModel.getMessages(idClientRequest);
        setIsLoading(false);
        if (Array.isArray(response)) {
            setMessages(response);
            viewModel.markRead(idClientRequest);
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    useEffect(() => {
        loadMessages();
        const offMessage = viewModel.listenerTripMessage(idClientRequest, (message) => {
            setMessages((current) => viewModel.addMessage(current, message));
            // Con el chat abierto, lo que llega ya se está leyendo
            viewModel.markRead(idClientRequest);
        });
        const offClosed = viewModel.listenerTripClosed(idClientRequest, () => setIsClosed(true));
        return () => {
            offMessage();
            offClosed();
        };
    }, []);

    // Mientras se ve este chat no salen avisos push de sus mensajes
    useFocusEffect(useCallback(() => {
        setOpenChat(idClientRequest);
        return () => setOpenChat(null);
    }, [idClientRequest]));

    const handleSend = async () => {
        if (isSending || !viewModel.canSend(text)) return;
        setIsSending(true);
        const response = await viewModel.sendMessage(idClientRequest, text);
        setIsSending(false);
        if ('id' in response) {
            setMessages((current) => viewModel.addMessage(current, response));
            setText('');
        } else {
            if (response.statusCode === 409) setIsClosed(true);
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    const renderMessage = ({ item }: { item: TripMessage }) => {
        const mine = item.id_sender === myId;
        return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <AppText variant="body" color={mine ? 'textOnDark' : 'text'}>{item.text}</AppText>
                <AppText variant="caption" color={mine ? 'textOnDarkMuted' : 'textMuted'} style={styles.time}>
                    {formatTime(item.created_at)}{mine && item.read_at ? ' · Leído' : ''}
                </AppText>
            </View>
        );
    }

    const canSend = viewModel.canSend(text) && !isSending;

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title={otherName ?? 'Chat del viaje'} subtitle="Chat del viaje" onBack={() => navigation.goBack()} />
            <KeyboardArea style={styles.body} aboveBottomInset>
                {isLoading
                    ? <StateView kind="loading" />
                    : messages.length === 0
                        ? <StateView kind="empty" icon="chatbubbles-outline" title="Todavía no hay mensajes" message="Escribe para coordinar la recogida o la entrega. Tu número de celular no se comparte." />
                        // Invertida: el último mensaje queda abajo y la lista arranca ahí
                        : <FlatList
                            style={styles.flex}
                            contentContainerStyle={styles.list}
                            data={[...messages].reverse()}
                            inverted
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderMessage}
                        />
                }

                {isClosed
                    ? <View style={styles.closed}><Notice tone="info" message="El viaje terminó: el chat queda solo para leer." /></View>
                    : <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mensaje"
                            placeholderTextColor={colors.textMuted}
                            value={text}
                            onChangeText={setText}
                            maxLength={MAX_MESSAGE_LENGTH}
                            multiline
                            accessibilityLabel="Mensaje"
                        />
                        <Pressable
                            style={({ pressed }) => [styles.send, !canSend && styles.sendDisabled, pressed && styles.sendPressed]}
                            onPress={handleSend}
                            disabled={!canSend}
                            accessibilityRole="button"
                            accessibilityLabel="Enviar mensaje"
                            accessibilityState={{ disabled: !canSend, busy: isSending }}
                        >
                            <Ionicons name="send" size={20} color={colors.asphalt} />
                        </Pressable>
                    </View>
                }
            </KeyboardArea>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Blanco arriba (barra de estado y encabezado) y abajo (campo); gris solo detrás de los mensajes
    screen: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    body: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    flex: {
        flex: 1,
    },
    list: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xxs,
    },
    mine: {
        alignSelf: 'flex-end',
        backgroundColor: colors.asphalt,
        borderBottomRightRadius: radius.sm / 2,
    },
    theirs: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        borderBottomLeftRadius: radius.sm / 2,
    },
    time: {
        alignSelf: 'flex-end',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.sm,
        padding: spacing.sm,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        maxHeight: 120,
        minHeight: touchTarget,
        borderRadius: touchTarget / 2,
        backgroundColor: colors.surfaceMuted,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontFamily: fonts.regular,
        fontSize: 16,
        color: colors.text,
    },
    send: {
        width: touchTarget,
        height: touchTarget,
        borderRadius: touchTarget / 2,
        backgroundColor: colors.cargo,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendPressed: {
        backgroundColor: colors.cargoPressed,
    },
    sendDisabled: {
        opacity: 0.45,
    },
    closed: {
        padding: spacing.md,
        backgroundColor: colors.surface,
    },
});
