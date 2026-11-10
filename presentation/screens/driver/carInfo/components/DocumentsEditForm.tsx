import { StyleSheet, View } from "react-native";
import { AppText, Button, ChipGroup, TextField } from "../../../../components/ui";
import { spacing } from "../../../../theme";
import { allowsTruck, documentLabels, vehicleRules } from "../../../../utils/VehicleRules";
import { DocumentsForm, DocumentsFormErrors } from "../DriverCarInfoViewModel";
import { useTranslation } from 'react-i18next';

interface Props {
    form: DocumentsForm;
    errors: DocumentsFormErrors;
    // Un camión solo admite licencias B2/C2 en adelante
    isHeavy: boolean;
    // País del conductor: categorías de licencia y nombres de los documentos
    countryCode?: string | null;
    saving: boolean;
    onChange: (changes: Partial<DocumentsForm>) => void;
    onSave: () => void;
    onCancel: () => void;
}

// Renovar la licencia, el SOAT o la técnico-mecánica: la categoría y las nuevas fechas de vencimiento
export default function DocumentsEditForm({ form, errors, isHeavy, countryCode, saving, onChange, onSave, onCancel }: Props) {
    const { t } = useTranslation();
    const rules = vehicleRules(countryCode);
    const labels = documentLabels(countryCode, {
        soat: t('documentsEditForm.elSoatVenceEl'),
        techno: t('documentsEditForm.laRevisionTecnicoMecanicaVence'),
        propertyCard: '',
    });
    return (
        <View style={styles.form}>
            <View style={styles.field}>
                <AppText variant="smallStrong">{t('documentsEditForm.categoriaDeLaLicencia')}</AppText>
                <ChipGroup
                    options={rules.licenseCategories.map((category) => ({ value: category, label: category, disabled: isHeavy && !allowsTruck(category, countryCode) }))}
                    selected={form.licenseCategory || null}
                    onSelect={(licenseCategory) => onChange({ licenseCategory })}
                />
                {errors.licenseCategory && <AppText variant="caption" color="danger">{errors.licenseCategory}</AppText>}
            </View>
            <TextField label={t('documentsEditForm.laLicenciaVenceEl')} placeholder="DD/MM/AAAA" value={form.licenseExpires} onChangeText={(licenseExpires) => onChange({ licenseExpires })} error={errors.licenseExpires} keyboardType="numbers-and-punctuation" maxLength={10} />
            <TextField label={labels.soat} placeholder="DD/MM/AAAA" value={form.soatExpires} onChangeText={(soatExpires) => onChange({ soatExpires })} error={errors.soatExpires} keyboardType="numbers-and-punctuation" maxLength={10} />
            <TextField
                label={labels.techno}
                placeholder="DD/MM/AAAA"
                hint={t('documentsEditForm.dejalaVaciaSiTuVehiculo')}
                value={form.technoExpires}
                onChangeText={(technoExpires) => onChange({ technoExpires })}
                error={errors.technoExpires}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
            />
            <Button title={t('documentsEditForm.guardarDocumentos')} variant="dark" loading={saving} onPress={onSave} />
            <Button title={t('common.cancelar')} variant="text" disabled={saving} onPress={onCancel} />
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: spacing.md,
    },
    field: {
        gap: spacing.sm,
    },
});
