import { Image, ImageProps } from "react-native";
import { BASE_URL } from "../../data/sources/remote/api/ApiRequestHandler";
import { useAuth } from "../hooks/useAuth";

interface Props extends Omit<ImageProps, 'source'> {
    // Ruta del backend, por ejemplo /client-requests/12/photos/3
    path: string;
}

// Las fotos de viajes y vehículos no son públicas: se piden con el token de la sesión
export default function AuthImage({ path, ...imageProps }: Props) {
    const { authResponse } = useAuth();
    return (
        <Image
            {...imageProps}
            source={{ uri: `${BASE_URL}${path}`, headers: authResponse?.token ? { Authorization: authResponse.token } : undefined }}
        />
    );
}
