# FleteYa · App móvil

App de **FleteYa** para clientes y conductores. En FleteYa el cliente propone el precio de su flete y los conductores le hacen ofertas, al estilo InDriver. Solo maneja vehículos de carga: carry, camioneta de estacas, furgón y camión.

El backend está en [FleteYa-Backend](https://github.com/AlejoLabs/FleteYa-Backend).

## Qué hace

**Cliente**
- Pide un flete en 4 pasos: ruta, carga, medidas con vehículo y precio.
- Puede programar el flete, pedir ayuda para cargar y avisar si otra persona entrega o recibe la carga.
- Ve el precio sugerido, sube su oferta y elige entre las ofertas de los conductores.
- Sigue el viaje en el mapa en vivo, ve las fotos de la carga y tiene el código de entrega para compartir con quien recibe.
- Paga en efectivo o por la app (tarjeta, Nequi o PSE), califica al conductor y puede reportar un problema.

**Conductor**
- En el inicio ve lo que ganó hoy (ya sin la comisión), su disponibilidad y avisos de solicitudes nuevas cerca.
- Solo le aparecen las solicitudes que caben en su vehículo, y puede ofertar con su propio precio.
- En el viaje: navegación, foto al cargar y al entregar, y cierre con el código de entrega.
- En "Mi vehículo" cambia el tipo y la capacidad real del vehículo, actualiza los documentos y sube fotos.

**Los dos**
- Chat del viaje, sin compartir el número de celular.
- Notificaciones push, historial y próximos fletes.
- Perfil, cambio de contraseña y entrar con Google.

## Tecnologías

React Native 0.83 con Expo 55 (compilación nativa, no Expo Go), TypeScript, React Navigation, react-native-maps con Google Maps, Socket.IO, Axios, Awilix para la inyección de dependencias, expo-notifications con Firebase Cloud Messaging y Google Sign-In.

## Arquitectura

Clean Architecture con MVVM: cada pantalla tiene su ViewModel y cada acción del negocio es un caso de uso en su propio archivo.

```
domain/         Modelos, interfaces de repositorios y casos de uso
data/           Repositorios, servicios HTTP y de socket, almacenamiento local
presentation/
├── screens/    Pantallas por flujo (auth, client, driver, trip, profile…), cada una con su ViewModel
├── components/ Componentes compartidos y el sistema de diseño (components/ui)
├── theme/      Colores, tipografía y espacios de la marca
├── navigator/  Menú lateral y pilas de navegación
├── context/    Sesión (AuthContext)
├── hooks/      Hooks compartidos (sesión, abrir la pantalla de una notificación)
└── utils/      Formatos, fotos, notificaciones
di/             Registro de dependencias (Awilix)
android/        Proyecto nativo de Android
```

## Requisitos

- Node.js 20 o más nuevo.
- Android Studio con un emulador (o un celular Android) y JDK 17.
- El [backend](https://github.com/AlejoLabs/FleteYa-Backend) corriendo.
- Una llave de Google Maps con **Maps SDK for Android**, **Directions API**, **Places API** y **Geocoding API** activas.

## Puesta en marcha

```bash
git clone https://github.com/AlejoLabs/FleteYa-Frontend.git
cd FleteYa-Frontend
npm install

# Variables de entorno: copia el ejemplo y llena tus valores
cp .env.example .env

# Compila e instala la app en el emulador o el celular conectado
npx expo run:android

# Las siguientes veces basta con Metro
npx expo start --dev-client
```

La llave de Google Maps se lee del `.env` también al compilar: Gradle la escribe en el `AndroidManifest`, así que nunca queda en el código.

Si compilar en Windows falla por rutas demasiado largas, `scripts/run-android-win-shortpath.ps1` compila desde una ruta corta.

## Variables de entorno

Todas están explicadas en [`.env.example`](.env.example).

| Variable | Para qué sirve |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Dirección del backend. Desde un emulador o un celular, usa la IP de tu PC en la red Wi-Fi |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa, rutas y búsqueda de direcciones |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Entrar con Google |

Las variables `EXPO_PUBLIC_` quedan dentro de la app instalada, así que cualquiera puede leerlas. Por eso la llave de Google Maps debe estar **restringida** en Google Cloud: solo al paquete de la app con su SHA-1 y solo a las APIs que usa.

## Archivos que no van en el repositorio

- `.env`, con tus valores reales.
- `android/app/google-services.json`: se descarga de Firebase (Configuración del proyecto → tu app Android). Sin él la app compila igual, pero sin notificaciones push.

`android/app/debug.keystore` sí está en el repositorio. Es la llave de depuración estándar de Android (clave `android`) y solo sirve para compilaciones de prueba. Una versión para publicar en Play Store necesita su propia llave, que nunca se sube.

## Nombre del paquete

La app se llama FleteYa, pero el paquete de Android sigue siendo `com.anonymous.InDriverReactNative`, porque Firebase y el inicio de sesión con Google están registrados con ese nombre. Se cambiará al preparar la versión para publicar, junto con un registro nuevo en Firebase y Google Cloud.

## Probar un pago

Con el backend en modo de prueba, "Pagar por la app" abre una pasarela de prueba. Los datos que acepta están en el [README del backend](https://github.com/AlejoLabs/FleteYa-Backend#pagos-de-prueba). La tarjeta `4242 4242 4242 4242` aprueba.

## Licencia

[MIT](LICENSE) © 2026 Alejandro Beltrán
