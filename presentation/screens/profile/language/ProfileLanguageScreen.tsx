import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, Card, ListItem, useToast } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { LanguageCode } from "../../../../i18n/languages";
import { ProfileLanguageViewModel } from "./ProfileLanguageViewModel";
import { formatErrorMessage } from "../../../utils/Formatters";

interface Props extends StackScreenProps<ProfileStackParamList, 'ProfileLanguageScreen'> { };

// Idioma de la app: español, inglés, francés, italiano, portugués y alemán
export default function ProfileLanguageScreen({ navigation }: Props) {
    const { t, i18n } = useTranslation();
    const viewModel: ProfileLanguageViewModel = container.resolve('profileLanguageViewModel');
    const { authResponse, saveAuthSession } = useAuth();
    const { showToast } = useToast();
    const selected = i18n.language as LanguageCode;

    const handleSelect = async (language: LanguageCode) => {
        if (language === selected) return;
        const response = await viewModel.select(language);
        // La sesión guardada también cambia, para que el idioma no vuelva al anterior al abrir la app
        if (authResponse?.user) await saveAuthSession({ ...authResponse, user: { ...authResponse.user, language } });
        if (response !== true) showToast(formatErrorMessage(response.message), 'error');
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title={t('profileLanguage.idioma')} onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                <AppText variant="body" color="textMuted">{t('profileLanguage.elegirIdioma')}</AppText>
                <Card style={styles.card}>
                    {viewModel.options().map((language) => (
                        <ListItem
                            key={language.code}
                            title={language.nativeName}
                            onPress={() => handleSelect(language.code)}
                            showChevron={false}
                            right={language.code === selected ? <Ionicons name="checkmark" size={22} color={colors.success} /> : undefined}
                        />
                    ))}
                </Card>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surfaceMuted },
    content: { padding: spacing.lg, gap: spacing.lg },
    card: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, gap: 0 },
});
