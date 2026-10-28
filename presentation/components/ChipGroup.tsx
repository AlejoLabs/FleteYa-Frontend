import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ChipOption<T> {
    value: T;
    label: string;
    disabled?: boolean;
}

interface Props<T> {
    options: ChipOption<T>[];
    selected: T | null;
    onSelect: (value: T) => void;
}

// Selector de una opción en forma de fichas; las deshabilitadas se ven pero no se pueden tocar
export default function ChipGroup<T>({ options, selected, onSelect }: Props<T>) {
    return (
        <View style={styles.row}>
            {options.map((option) => {
                const isSelected = option.value === selected;
                return (
                    <TouchableOpacity
                        key={String(option.value)}
                        disabled={option.disabled}
                        onPress={() => onSelect(option.value)}
                        style={[styles.chip, isSelected && styles.chipSelected, option.disabled && styles.chipDisabled]}
                    >
                        <Text style={[styles.text, isSelected && styles.textSelected, option.disabled && styles.textDisabled]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: 'white',
    },
    chipSelected: {
        backgroundColor: 'black',
        borderColor: 'black',
    },
    chipDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#eee',
    },
    text: {
        fontSize: 13,
        color: '#222',
    },
    textSelected: {
        color: 'white',
    },
    textDisabled: {
        color: '#aaa',
    },
});
