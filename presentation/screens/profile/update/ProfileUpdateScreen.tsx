import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { container } from "../../../../di/container";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { useAuth } from "../../../hooks/useAuth";
import { ProfileStackParamList } from "../../../navigator/ProfileStackNavigator";
import { AppHeader, AppText, Avatar, Button, KeyboardArea, TextField, useToast } from "../../../components/ui";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { ProfileErrors, ProfileForm, ProfileUpdateViewModel } from "./ProfileUpdateViewModel";

interface Props extends StackScreenProps<ProfileStackParamList, 'ProfileUpdateScreen'> { }

// Editar el nombre, el celular y la foto de perfil. El correo no se cambia aquí: con él se entra a la cuenta
export default function ProfileUpdateScreen({ navigation }: Props) {

    const viewModel: ProfileUpdateViewModel = container.resolve('profileUpdateViewModel');
    const { authResponse, saveAuthSession } = useAuth();
    const { showToast } = useToast();
    const user = authResponse?.user;
    const [form, setForm] = useState<ProfileForm>({ name: user?.name ?? '', lastname: user?.lastname ?? '', phone: user?.phone ?? '' });
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [image, setImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const update = (field: keyof ProfileForm) => (value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    const pickImage = async () => {
        const result = await choosePhoto('Foto de perfil');
        if (result.ok) setImage(result.uri);
        else if (!result.cancelled) showToast(result.message, 'error');
    }

    const handleSave = async () => {
        if (!user || !authResponse) return;
        const problems = viewModel.validate(form);
        setErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setSaving(true);
        const response = await viewModel.save(user, form, image);
        setSaving(false);
        if ('id' in response) {
            showToast('Guardamos tus datos', 'success');
            saveAuthSession({ user: { ...response, roles: user.roles }, token: authResponse.token });
            navigation.goBack();
        } else {
            showToast(formatErrorMessage((response as ErrorResponse).message), 'error');
        }
    }

    if (!user) return null;
    const currentImage = image ?? (user.image ? `${user.image}?t=${user.update_at}` : null);

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title="Editar perfil" onBack={() => navigation.goBack()} />
            <KeyboardArea style={styles.flex} aboveBottomInset>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Pressable onPress={pickImage} style={styles.photo} accessibilityRole="button" accessibilityLabel="Cambiar la foto de perfil">
                        <View>
                            <Avatar name={`${form.name} ${form.lastname}`} imageUri={currentImage} size={96} />
                            <View style={styles.camera}>
                                <Ionicons name="camera" size={18} color={colors.asphalt} />
                            </View>
                        </View>
                        <AppText variant="smallStrong">Cambiar foto</AppText>
                    </Pressable>

                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <TextField label="Nombre" value={form.name} onChangeText={update('name')} error={errors.name} autoCapitalize="words" />
                        </View>
                        <View style={styles.flex}>
                            <TextField label="Apellido" value={form.lastname} onChangeText={update('lastname')} error={errors.lastname} autoCapitalize="words" />
                        </View>
                    </View>
                    <TextField label="Celular" prefix="+57" value={form.phone} onChangeText={update('phone')} error={errors.phone} keyboardType="phone-pad" maxLength={13} />
                    <TextField label="Correo" value={user.email} editable={false} hint="Con tu correo entras a FleteYa: no se puede cambiar." />
                </ScrollView>
                <View style={styles.footer}>
                    <Button title="Guardar cambios" loading={saving} onPress={handleSave} />
                </View>
            </KeyboardArea>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    photo: {
        alignSelf: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    camera: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cargo,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
