# 🚛 FleteYa - Mobile

![React Native](https://img.shields.io/badge/React_Native-Expo_55-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-realtime-black)

Aplicación móvil de transporte de carga en Colombia, inspirada en el modelo InDriver. Conecta clientes que necesitan transportar carga con conductores disponibles en tiempo real.

## Características

### Cliente
- Búsqueda de origen y destino con autocompletado de Google Places
- Solicitud de viaje con descripción de carga, peso y dimensiones
- Visualización de ofertas de conductores en tiempo real
- Mapa en vivo con posición del conductor durante el viaje
- Calificación del conductor al finalizar el viaje
- Historial de viajes

### Conductor
- Mapa con posición actual en tiempo real
- Lista de solicitudes de clientes cercanos
- Envío de ofertas con tarifa propia
- Mapa en vivo durante el viaje con datos del cliente
- Calificación del cliente al finalizar el viaje
- Historial de cargas
- Gestión de información del vehículo

### General
- Registro e inicio de sesión con JWT
- Selección de rol al ingresar (Cliente / Conductor)
- Perfil de usuario editable
- Navegación con Drawer y Stack

## Arquitectura

El proyecto sigue **Clean Architecture** con patrón **MVVM**:

```
├── domain/          # Modelos, interfaces de repositorios y casos de uso
├── data/            # Implementaciones de repositorios, fuentes remotas y locales
├── presentation/    # Pantallas, ViewModels, navegación y componentes
└── di/              # Contenedor de inyección de dependencias (Awilix)
```

## Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Framework | React Native + Expo ~55 |
| Lenguaje | TypeScript |
| Navegación | React Navigation (Stack + Drawer) |
| Mapas | react-native-maps + Google Maps API |
| Places | react-native-google-places-autocomplete |
| HTTP | Axios |
| Tiempo real | Socket.IO Client |
| Almacenamiento local | AsyncStorage |
| Geolocalización | expo-location |
| Inyección de dependencias | Awilix |
| Animaciones | Lottie |

## Requisitos Previos

- Node.js >= 18
- Expo CLI (`npm install -g expo-cli`)
- Android Studio con emulador configurado, o dispositivo físico con Expo Go
- Backend corriendo (ver variable `EXPO_PUBLIC_API_BASE_URL`)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/AlejoLabs/FleteYa-Mobile.git
cd InDriverReactNative

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

## Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
EXPO_PUBLIC_API_BASE_URL=http://tu_servidor:3000
```

> Las variables prefijadas con `EXPO_PUBLIC_` son accesibles en el código de la app. Nunca subas el archivo `.env` al repositorio.

## Ejecución

```bash
# Iniciar Metro Bundler
npm start

# Correr en Android
npm run android

# Correr en iOS
npm run ios
```

## Estructura de Carpetas

```
├── app.config.ts              # Configuración de Expo (lee variables de entorno)
├── data/
│   ├── repository/            # Implementaciones de repositorios
│   └── sources/
│       ├── local/             # AsyncStorage
│       └── remote/
│           ├── api/           # Configuración de Axios y API Keys
│           └── services/      # Servicios (Socket, etc.)
├── di/
│   └── container.tsx          # Registro de dependencias con Awilix
├── domain/
│   ├── models/                # Interfaces y tipos de dominio
│   ├── repository/            # Interfaces de repositorios
│   └── useCases/              # Casos de uso por feature
├── presentation/
│   ├── components/            # Componentes reutilizables
│   ├── context/               # AuthContext
│   ├── hooks/                 # Custom hooks
│   ├── navigator/             # Navegadores (Main, Client, Driver, Profile)
│   └── screens/
│       ├── auth/              # Login y Registro
│       ├── client/            # Pantallas del cliente
│       ├── driver/            # Pantallas del conductor
│       ├── profile/           # Perfil de usuario
│       └── roles/             # Selección de rol
└── assets/                    # Imágenes, íconos y animaciones Lottie
```
