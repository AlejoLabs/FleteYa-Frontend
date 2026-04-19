import AsyncStorage from '@react-native-async-storage/async-storage';

export class LocalStorage {

    async save(key: string, value: string) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error("Error en local storage", error);
        }
    }

    async getItem(key: string) {
        try {
            const item = await AsyncStorage.getItem(key);
            return item;
        } catch (error) {
            console.error("Error en local storage", error);
        }
    }

    async remove(key: string) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error("Error en local storage", error);
        }
    }
    
}