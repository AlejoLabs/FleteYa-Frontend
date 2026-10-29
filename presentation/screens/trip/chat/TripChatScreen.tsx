import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { TripChatViewModel, MAX_MESSAGE_LENGTH } from "./TripChatViewModel";
import { TripMessage } from "../../../../domain/models/TripMessage";
import { useAuth } from "../../../hooks/useAuth";
import ScreenHeader from "../../../components/ScreenHeader";
import { formatErrorMessage, formatTime } from "../../../utils/Formatters";
import { setOpenChat } from "../../../utils/PushNotifications";

type Props = NativeStackScreenProps<TripSharedParamList, 'TripChatScreen'>;

export function TripChatScreen({ navigation, route }: Props) {

    const { idClientRequest, otherName, readOnly } = route.params;
    const viewModel: TripChatViewModel = container.resolve('tripChatViewModel');
    const { authResponse } = useAuth();
    const myId = authResponse?.user.id;
    const insets = useSafeAreaInsets();
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
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
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
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    const renderMessage = ({ item }: { item: TripMessage }) => {
        const mine = item.id_sender === myId;
        return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={mine ? styles.mineText : styles.theirsText}>{item.text}</Text>
                <Text style={[styles.time, mine && styles.mineTime]}>{formatTime(item.created_at)}</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScreenHeader title={otherName ? `Chat con ${otherName}` : 'Chat del viaje'} onBack={() => navigation.goBack()} />

            {isLoading
                ? <ActivityIndicator style={styles.center} size="large" />
                : messages.length === 0
                    ? <Text style={[styles.center, styles.empty]}>Escribe para coordinar la recogida o la entrega. Tu número de celular no se comparte.</Text>
                    // Invertida: el último mensaje queda abajo y la lista arranca ahí
                    : <FlatList
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        data={[...messages].reverse()}
                        inverted
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderMessage}
                    />
            }

            {isClosed
                ? <Text style={[styles.closed, { paddingBottom: insets.bottom + 12 }]}>El viaje terminó: el chat queda solo para leer.</Text>
                : <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje"
                        placeholderTextColor="#888"
                        value={text}
                        onChangeText={setText}
                        maxLength={MAX_MESSAGE_LENGTH}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.send, (!viewModel.canSend(text) || isSending) && styles.sendDisabled]}
                        onPress={handleSend}
                        disabled={!viewModel.canSend(text) || isSending}
                        accessibilityLabel="Enviar mensaje"
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            }
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    center: {
        flex: 1,
        textAlignVertical: 'center',
    },
    empty: {
        textAlign: 'center',
        color: '#666',
        paddingHorizontal: 40,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 12,
        gap: 6,
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    mine: {
        alignSelf: 'flex-end',
        backgroundColor: '#1f7a3d',
        borderBottomRightRadius: 4,
    },
    theirs: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    mineText: {
        color: 'white',
        fontSize: 15,
    },
    theirsText: {
        color: 'black',
        fontSize: 15,
    },
    time: {
        fontSize: 11,
        color: '#777',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    mineTime: {
        color: '#d8eedd',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 10,
        paddingTop: 8,
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        maxHeight: 110,
        minHeight: 44,
        borderRadius: 22,
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: 'black',
    },
    send: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1f7a3d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendDisabled: {
        backgroundColor: '#9bbfa6',
    },
    closed: {
        textAlign: 'center',
        color: '#666',
        paddingTop: 12,
        backgroundColor: 'white',
    },
});
