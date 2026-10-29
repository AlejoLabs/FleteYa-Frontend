import { ConfirmDialog, TextField, Button } from "../../../components/ui";
import { GoogleLinkState } from "./useGoogleSignIn";

interface Props {
    link: GoogleLinkState;
    loading: boolean;
    onForgotPassword: () => void;
}

// Se abre cuando el correo de Google ya tiene cuenta con contraseña
export default function GoogleLinkDialog({ link, loading, onForgotPassword }: Props) {
    return (
        <ConfirmDialog
            visible={link.visible}
            title="Vincula tu cuenta de Google"
            message="Ya tienes una cuenta con este correo. Escribe tu contraseña una sola vez y después podrás entrar de las dos formas."
            confirmLabel="Vincular y entrar"
            cancelLabel="Cancelar"
            loading={loading}
            onConfirm={link.onConfirm}
            onCancel={link.onCancel}
        >
            <TextField
                label="Contraseña de tu cuenta"
                value={link.password}
                onChangeText={link.onChangePassword}
                error={link.error}
                secureTextEntry
                autoFocus
                returnKeyType="go"
                onSubmitEditing={link.onConfirm}
            />
            <Button
                title="No recuerdo mi contraseña"
                variant="text"
                size="sm"
                disabled={loading}
                onPress={() => { link.onCancel(); onForgotPassword(); }}
            />
        </ConfirmDialog>
    );
}
