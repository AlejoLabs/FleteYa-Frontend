import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "@empglabs/react-native-star-rating-widget";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { Amount, AppText, Avatar, Button, Card } from "../../../components/ui";
import { getTripFare } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { shortPlace } from "../TripStatus";

const WORDS = ['', 'Mal', 'Regular', 'Bien', 'Muy bien', 'Excelente'];

// "4 de 5 · Muy bien"; con media estrella se usa la palabra de la estrella entera de abajo
const ratingText = (rating: number) => rating === 0
    ? 'Toca las estrellas para calificar'
    : `${String(rating).replace('.', ',')} de 5 · ${WORDS[Math.floor(rating)] || WORDS[1]}`;

interface Props {
    request: ClientRequestResponse;
    // La otra persona del viaje: el conductor para el cliente, el cliente para el conductor
    person: { name: string; lastname: string; image?: string | null };
    fareLabel: string;
    sending: boolean;
    onSubmit: (rating: number) => void;
    onReport: () => void;
}

// Cierre del viaje que ven los dos: la entrega, el valor y las estrellas para la otra persona
export default function TripRatingView({ request, person, fareLabel, sending, onSubmit, onReport }: Props) {
    const [rating, setRating] = useState(0);
    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.done}>
                    <View style={styles.check}>
                        <Ionicons name="checkmark" size={44} color={colors.textOnDark} />
                    </View>
                    <AppText variant="display" align="center" accessibilityRole="header">Carga entregada</AppText>
                    <AppText variant="body" color="textMuted" align="center">
                        {shortPlace(request.pickup_description)} → {shortPlace(request.destination_description)}
                    </AppText>
                </View>

                <Card variant="muted" style={styles.fare}>
                    <AppText variant="small" color="textMuted">{fareLabel}</AppText>
                    <Amount value={getTripFare(request)} size="lg" />
                </Card>

                <View style={styles.rate}>
                    <Avatar name={`${person.name} ${person.lastname}`} imageUri={person.image} size={64} />
                    <AppText variant="heading" align="center">¿Cómo te fue con {person.name}?</AppText>
                    <StarRating rating={rating} onChange={setRating} maxStars={5} starSize={44} color={colors.star} emptyColor={colors.borderStrong} style={styles.stars} />
                    <AppText variant="small" color="textMuted" accessibilityLiveRegion="polite">{ratingText(rating)}</AppText>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Enviar calificación" loading={sending} disabled={rating === 0} onPress={() => onSubmit(rating)} />
                <Button title="¿Algo salió mal? Reportar un problema" variant="text" onPress={onReport} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flexGrow: 1,
        padding: spacing.lg,
        gap: spacing.xl,
        justifyContent: 'center',
    },
    done: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    check: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        marginBottom: spacing.xs,
    },
    fare: {
        alignItems: 'center',
        gap: spacing.xxs,
    },
    rate: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    // La librería ocupa todo el ancho y deja las estrellas a la izquierda
    stars: {
        alignSelf: 'center',
    },
    footer: {
        padding: spacing.lg,
        gap: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
