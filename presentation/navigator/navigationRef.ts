import { createNavigationContainerRef } from "@react-navigation/native";

// Para navegar desde fuera de una pantalla (por ejemplo, volver al inicio de sesión cuando el token vence)
export const navigationRef = createNavigationContainerRef<any>();
