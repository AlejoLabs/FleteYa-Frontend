import { StyleSheet, View } from "react-native";
import { AppText, ChipGroup, SegmentedTabs } from "../../../../components/ui";
import { spacing } from "../../../../theme";

// Los fletes programados van de 1 hora a 30 días adelante; la app ofrece los próximos 7 días entre 6 a. m. y 8 p. m.
const SCHEDULE_DAYS = 7;
const SCHEDULE_HOURS = Array.from({ length: 15 }, (_, i) => i + 6);
const MIN_AHEAD_MS = 60 * 60 * 1000;

const dayStart = (offset: number) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
}

const dayLabel = (offset: number) => {
    if (offset === 0) return 'Hoy';
    if (offset === 1) return 'Mañana';
    return dayStart(offset).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
}

const scheduleDate = (dayOffset: number, hour: number) => {
    const date = dayStart(dayOffset);
    date.setHours(hour);
    return date;
}

const isTooSoon = (dayOffset: number, hour: number) => scheduleDate(dayOffset, hour).getTime() < Date.now() + MIN_AHEAD_MS;

interface Props {
    // null = "Ahora"
    value: Date | null;
    onChange: (value: Date | null) => void;
}

// Ahora o programado: día y hora en fichas, sin las horas que ya pasaron o que faltan menos de una hora
export default function SchedulePicker({ value, onChange }: Props) {
    const scheduledDay = value ? Math.round((new Date(value).setHours(0, 0, 0, 0) - dayStart(0).getTime()) / 86400000) : null;
    const scheduledHour = value ? new Date(value).getHours() : null;
    const firstDayWithHours = Array.from({ length: SCHEDULE_DAYS }, (_, i) => i).find((day) => SCHEDULE_HOURS.some((hour) => !isTooSoon(day, hour))) ?? 1;

    const selectDay = (dayOffset: number) => {
        const firstHour = SCHEDULE_HOURS.find((hour) => !isTooSoon(dayOffset, hour));
        const hour = scheduledHour !== null && !isTooSoon(dayOffset, scheduledHour) ? scheduledHour : firstHour;
        if (hour !== undefined) onChange(scheduleDate(dayOffset, hour));
    }

    return (
        <View style={styles.container}>
            <SegmentedTabs
                options={[{ value: 'NOW', label: 'Ahora' }, { value: 'LATER', label: 'Programar' }]}
                selected={value ? 'LATER' : 'NOW'}
                onSelect={(option) => option === 'NOW' ? onChange(null) : selectDay(scheduledDay ?? firstDayWithHours)}
            />
            {value &&
                <>
                    <ChipGroup
                        options={Array.from({ length: SCHEDULE_DAYS }, (_, day) => ({
                            value: day,
                            label: dayLabel(day),
                            disabled: SCHEDULE_HOURS.every((hour) => isTooSoon(day, hour)),
                        }))}
                        selected={scheduledDay}
                        onSelect={selectDay}
                    />
                    <ChipGroup
                        options={SCHEDULE_HOURS.map((hour) => ({
                            value: hour,
                            label: scheduleDate(0, hour).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }),
                            disabled: isTooSoon(scheduledDay ?? 0, hour),
                        }))}
                        selected={scheduledHour}
                        onSelect={(hour) => onChange(scheduleDate(scheduledDay ?? 0, hour))}
                    />
                    <AppText variant="caption" color="textMuted">Los conductores pueden ofertar hasta 30 minutos antes.</AppText>
                </>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
});
