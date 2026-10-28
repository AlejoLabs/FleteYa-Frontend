import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface Props extends TextInputProps {
    label: string;
    hint?: string;
}

// Campo de formulario con su etiqueta arriba y una ayuda opcional debajo
export default function FormField({ label, hint, style, ...inputProps }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput placeholderTextColor="#999" style={[styles.input, style]} {...inputProps} />
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

export const formStyles = StyleSheet.create({
    screen: {
        flexGrow: 1,
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    subtitle: {
        color: '#555',
        marginTop: 6,
        marginBottom: 16,
    },
    section: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f7f7f7',
        color: 'black',
    },
    hint: {
        color: 'gray',
        fontSize: 12,
        marginTop: 3,
    },
});
