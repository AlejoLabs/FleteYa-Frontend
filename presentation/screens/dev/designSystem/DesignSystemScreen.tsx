import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    Amount, AppHeader, AppText, BrandMark, Button, Card, Chip, ChipGroup, ConfirmDialog, CountBadge, ListItem, Notice,
    OptionCard, PersonRow, PriceStepper, ProgressSteps, ReceiptCard, SegmentedTabs, Sheet, StateView, StatusPill,
    CodeInput, TextField, useToast,
} from "../../../components/ui";
import { colors, radius, spacing } from "../../../theme";

const CARGO_OPTIONS = [
    { value: 'MUDANZA', label: 'Mudanza' },
    { value: 'MERCANCIA', label: 'Mercancía' },
    { value: 'MATERIALES', label: 'Materiales' },
    { value: 'MAQUINARIA', label: 'Maquinaria', disabled: true },
];

// Catálogo del sistema de diseño, solo en desarrollo: sirve para revisar cada componente en el emulador.
// No tiene ViewModel porque no usa datos ni casos de uso; todo es estado de muestra
export default function DesignSystemScreen() {
    const { showToast } = useToast();
    const [cargo, setCargo] = useState<string | null>('MUDANZA');
    const [when, setWhen] = useState<'NOW' | 'LATER'>('NOW');
    const [price, setPrice] = useState(25000);
    const [payment, setPayment] = useState<'CASH' | 'NEQUI'>('CASH');
    const [dialog, setDialog] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('12');

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>

                <Section title="Marca y tipografía">
                    <View style={styles.brandBox}>
                        <BrandMark />
                        <AppText variant="body" color="textOnDarkMuted">Mueve cualquier carga. Tú pones el precio.</AppText>
                    </View>
                    <AppText variant="display">Display 32</AppText>
                    <AppText variant="title">Título 26</AppText>
                    <AppText variant="heading">Encabezado 18</AppText>
                    <AppText variant="body">Cuerpo 16: la carga va en camino y llega a las 11:09.</AppText>
                    <AppText variant="small" color="textMuted">Pequeño 14 en gris: Furgón JAC · VES129</AppText>
                    <AppText variant="label" color="textMuted">Etiqueta</AppText>
                    <Amount value={30000} />
                </Section>

                <Section title="Colores">
                    <View style={styles.swatches}>
                        {(['asphalt', 'cargo', 'surfaceMuted', 'success', 'danger', 'warning', 'info', 'cargoTint'] as const).map((name) => (
                            <View key={name} style={styles.swatch}>
                                <View style={[styles.swatchColor, { backgroundColor: colors[name] }]} />
                                <AppText variant="caption" color="textMuted" numberOfLines={1}>{name}</AppText>
                            </View>
                        ))}
                    </View>
                </Section>

                <Section title="Botones">
                    <Button title="Publicar flete" onPress={() => showToast('Flete publicado', 'success')} />
                    <Button title="Crear cuenta" variant="dark" onPress={() => showToast('Aviso informativo')} />
                    <Button title="Subir mi precio" variant="secondary" icon="trending-up" onPress={() => { }} />
                    <Button title="Aceptar por $25.000" variant="success" onPress={() => { }} />
                    <Button title="Rechazar" variant="danger" onPress={() => { }} />
                    <Button title="Continuar con Google" variant="google" icon="logo-google" onPress={() => { }} />
                    <Button title="Guardando" loading onPress={() => { }} />
                    <Button title="Deshabilitado" disabled onPress={() => { }} />
                    <View style={styles.row}>
                        <Button title="Chico" size="sm" variant="dark" onPress={() => { }} style={styles.flex} />
                        <Button title="Cancelar búsqueda" size="sm" variant="dangerText" onPress={() => setDialog(true)} style={styles.flex} />
                    </View>
                </Section>

                <Section title="Campos">
                    <TextField label="Correo" placeholder="tu@correo.com" keyboardType="email-address" icon="mail-outline" value={email} onChangeText={setEmail} hint="Te enviamos el código aquí" />
                    <TextField label="Contraseña" placeholder="Mínimo 6 caracteres" secureTextEntry icon="lock-closed-outline" />
                    <TextField label="Placa" placeholder="ABC123" error="La placa debe tener 3 letras y 3 números" />
                    <TextField label="Celular" prefix="+57" placeholder="300 123 4567" keyboardType="phone-pad" />
                    <CodeInput label="Código" length={6} value={code} onChangeText={setCode} />
                    <View style={styles.darkBox}>
                        <TextField tone="dark" placeholder="Correo" icon="mail-outline" />
                        <Button title="Entrar" onPress={() => { }} />
                        <Button title="Continuar con Google" variant="onDark" icon="logo-google" onPress={() => { }} />
                    </View>
                </Section>

                <Section title="Fichas, pestañas y opciones">
                    <ChipGroup options={CARGO_OPTIONS} selected={cargo} onSelect={setCargo} />
                    <View style={styles.row}>
                        <Chip label="Frágil" tone="cargo" />
                        <Chip label="Cabe en tu furgón" tone="success" icon="checkmark" />
                        <Chip label="25 kg · 0,6 m³" />
                    </View>
                    <SegmentedTabs options={[{ value: 'NOW', label: 'Ahora' }, { value: 'LATER', label: 'Programar' }]} selected={when} onSelect={setWhen} />
                    <OptionCard title="Efectivo" description="Pagas al conductor al entregar" icon="cash-outline" selected={payment === 'CASH'} onPress={() => setPayment('CASH')} />
                    <OptionCard title="Nequi" description="Por Wompi" icon="phone-portrait-outline" selected={payment === 'NEQUI'} onPress={() => setPayment('NEQUI')} />
                </Section>

                <Section title="Precio y montos">
                    <PriceStepper value={price} onChange={setPrice} step={1000} min={5000} />
                    <ReceiptCard
                        lines={[
                            { label: 'Valor del flete', value: 27000 },
                            { label: 'Ayudante', value: 3000 },
                            { label: 'Incluye comisión FleteYa (10 %)', value: 3000, kind: 'fee' },
                        ]}
                        total={30000}
                        footnote="Pagado en efectivo al conductor"
                    />
                </Section>

                <Section title="Tarjetas y personas">
                    <Card>
                        <PersonRow name="Alejo Beltrán" subtitle="Furgón JAC · 4 min" rating={{ average: 4.8, count: 12 }} right={<Amount value={30000} />} />
                        <View style={styles.row}>
                            <Button title="Rechazar" variant="danger" size="sm" onPress={() => { }} style={styles.flex} />
                            <Button title="Aceptar" variant="success" size="sm" onPress={() => { }} style={styles.flex} />
                        </View>
                    </Card>
                    <Card variant="muted">
                        <PersonRow name="Marta Ruiz" subtitle="Cliente nueva" rating={{ average: null, count: 0 }} />
                    </Card>
                    <ProgressSteps steps={['Aceptado', 'En el origen', 'Carga recogida', 'Entregado']} current={2} />
                    <View style={styles.row}>
                        <StatusPill label="Disponible" tone="success" />
                        <StatusPill label="Vence pronto" tone="warning" />
                        <StatusPill label="Vencido" tone="danger" />
                        <StatusPill label="Programado" />
                        <CountBadge count={3} />
                    </View>
                </Section>

                <Section title="Avisos">
                    <Notice tone="cargo" message="Vehículo sugerido: carry o furgón · precio sugerido $27.400" />
                    <Notice tone="warning" title="SOAT por vencer" message="Vence en 12 días. Renuévalo para seguir recibiendo fletes." actionLabel="Actualizar documento" onAction={() => { }} />
                    <Notice tone="danger" message="El viaje terminó: el chat queda solo para leer." />
                    <Notice tone="success" message="Recibimos tu reporte. Te escribiremos al correo." />
                    <Notice tone="info" message="Modo de prueba: no se cobra dinero real." />
                </Section>

                <Section title="Encabezados">
                    <Card variant="outlined" style={styles.noPadding}>
                        <AppHeader title="Registro de conductor" subtitle="Datos del vehículo" onBack={() => { }} right={<AppText variant="small" color="textMuted">2 de 4</AppText>} />
                    </Card>
                    <Card variant="outlined" style={styles.noPadding}>
                        <AppHeader title="Alejo B." subtitle="Furgón · VES129" tone="dark" onBack={() => { }} right={<StatusPill label="En camino" tone="cargo" />} />
                    </Card>
                </Section>

                <Section title="Menú">
                    <Card>
                        <ListItem title="Solicitudes de carga" icon="list-outline" right={<CountBadge count={2} />} onPress={() => { }} />
                        <ListItem title="Mi vehículo" subtitle="Furgón · VES129" icon="bus-outline" onPress={() => { }} />
                        <ListItem title="Cerrar sesión" icon="exit-outline" tone="danger" onPress={() => { }} />
                    </Card>
                </Section>

                <Section title="Estados">
                    <Card variant="muted"><StateView kind="loading" message="Buscando conductores cerca…" /></Card>
                    <Card variant="muted"><StateView kind="empty" icon="calendar-outline" title="No tienes fletes programados" message="Cuando programes uno, aparece aquí." /></Card>
                    <Card variant="muted"><StateView kind="error" onAction={() => showToast('No se pudo cargar', 'error')} /></Card>
                    <Card variant="muted"><StateView kind="offline" onAction={() => { }} /></Card>
                </Section>

                <Section title="Hoja inferior">
                    <View style={styles.mapMock}>
                        <Sheet>
                            <AppText variant="heading">Tu carga va en camino</AppText>
                            <AppText variant="small" color="textMuted">Recogida 10:42 · llega 11:09</AppText>
                            <Button title="Compartir viaje" variant="secondary" onPress={() => { }} />
                        </Sheet>
                    </View>
                </Section>
            </ScrollView>

            <ConfirmDialog
                visible={dialog}
                title="¿Cancelar la búsqueda?"
                message="Los conductores que te ofertaron reciben un aviso."
                confirmLabel="Cancelar búsqueda"
                cancelLabel="Seguir buscando"
                tone="danger"
                onConfirm={() => { setDialog(false); showToast('Búsqueda cancelada'); }}
                onCancel={() => setDialog(false)}
            />
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <AppText variant="label" color="textMuted">{title}</AppText>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.xl,
        paddingBottom: spacing.xxl * 2,
    },
    section: {
        gap: spacing.md,
    },
    brandBox: {
        gap: spacing.xs,
        padding: spacing.xl,
        borderRadius: radius.lg,
        backgroundColor: colors.asphalt,
    },
    darkBox: {
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        backgroundColor: colors.asphalt,
    },
    swatches: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    swatch: {
        width: 72,
        gap: spacing.xs,
    },
    swatchColor: {
        height: 44,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing.sm,
    },
    flex: {
        flex: 1,
    },
    noPadding: {
        padding: 0,
        overflow: 'hidden',
    },
    mapMock: {
        height: 240,
        justifyContent: 'flex-end',
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: colors.surfaceMuted,
    },
});
