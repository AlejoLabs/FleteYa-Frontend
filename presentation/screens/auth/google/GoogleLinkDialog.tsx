import { ConfirmDialog, TextField, Button } from "../../../components/ui";
import { GoogleLinkState } from "./useGoogleSignIn";
import { useTranslation } from 'react-i18next';

interface Props {
    link: GoogleLinkState;
    loading: boolean;
    onForgotPassword: () => void;
}

// Se abre cuando el correo de Google ya tiene cuenta con contraseña
export default function GoogleLinkDialog({ link, loading, onForgotPassword }: Props) {
    const { t } = useTranslation();
    return (
        <ConfirmDialog
            visible={link.visible}
            title={t('googleLinkDialog.vinculaTuCuentaDeGoogle')}
            message={t('googleLinkDialog.yaTienesUnaCuentaCon')}
            confirmLabel={t('googleLinkDialog.vincularYEntrar')}
            cancelLabel={t('common.cancelar')}
            loading={loading}
            onConfirm={link.onConfirm}
            onCancel={link.onCancel}
        >
            <TextField
                label={t('googleLinkDialog.contrasenaDeTuCuenta')}
                value={link.password}
                onChangeText={link.onChangePassword}
                error={link.error}
                secureTextEntry
                autoFocus
                returnKeyType="go"
                onSubmitEditing={link.onConfirm}
            />
            <Button
                title={t('googleLinkDialog.noRecuerdoMiContrasena')}
                variant="text"
                size="sm"
                disabled={loading}
                onPress={() => { link.onCancel(); onForgotPassword(); }}
            />
        </ConfirmDialog>
    );
}
