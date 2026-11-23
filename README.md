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
- Después de registrarse queda "en revisión" hasta que un administrador aprueba su vehículo y sus documentos desde el panel web del backend. Si lo rechazan, ve el motivo y puede corregir. La app se actualiza sola en cuanto el administrador decide.
- En el inicio ve lo que ganó hoy (ya sin la comisión), su disponibilidad y avisos de solicitudes nuevas cerca.
- Solo le aparecen las solicitudes que caben en su vehículo, y puede ofertar con su propio precio.
- En el viaje: navegación, foto al cargar y al entregar, y cierre con el código de entrega.
- En "Mi vehículo" cambia el tipo y la capacidad real del vehículo, actualiza los documentos y sube fotos.

**Los dos**
- Chat del viaje, sin compartir el número de celular.
- Notificaciones push, historial y próximos fletes.
- Perfil, cambio de contraseña y entrar con Google.
- Seis idiomas y 24 países en 8 monedas (ver [Idiomas y monedas](#idiomas-y-monedas)).

## Tecnologías

React Native 0.83 con Expo 55 (compilación nativa, no Expo Go), TypeScript, React Navigation, react-native-maps con Google Maps, Socket.IO, Axios, Awilix para la inyección de dependencias, expo-notifications con Firebase Cloud Messaging, Google Sign-In, i18next con expo-localization y la API Intl para los formatos.

## Idiomas y monedas

- **Idiomas:** español, inglés, francés, italiano, portugués y alemán. Los textos están en `i18n/locales/*.json` (más de 900 claves cada uno) y se muestran con i18next. La app arranca en el idioma del teléfono; la persona lo cambia en Perfil → Idioma y queda guardado en su cuenta. Los errores del backend llegan como clave y la app los traduce.
- **Control de traducciones:** `node scripts/i18n/check.mjs` revisa que los seis idiomas tengan las mismas claves y que no quede texto fijo en español en las pantallas.
- **Monedas:** la moneda la define el país donde se recoge la carga (lo decide el backend). Los montos se muestran con `formatMoney`, que combina la moneda del flete con el formato del idioma: «$ 25.000», «25,00 €», «R$ 25,90». Debajo de un monto en otra moneda se ve una equivalencia aproximada («≈») en la moneda del país de la persona.
- **Probar otro país sin VPN:** la moneda depende del GPS, no de la IP. En el emulador, cambia la ubicación con `adb emu geo fix <longitud> <latitud>` y vuelve a abrir la app. Hay coordenadas de prueba en el [README del backend](https://github.com/AlejoLabs/FleteYa-Backend#datos-de-prueba).

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
| `EXPO_PUBLIC_API_BASE_URL` | Dirección del backend. Por cable USB: `http://localhost:3000` y en cada dispositivo `adb reverse tcp:3000 tcp:3000` (no hace falta la misma red Wi-Fi). Por Wi-Fi: la IP de tu PC en la red |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapa, rutas y búsqueda de direcciones |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Entrar con Google |

Las variables `EXPO_PUBLIC_` quedan dentro de la app instalada, así que cualquiera puede leerlas. Por eso la llave de Google Maps debe estar **restringida** en Google Cloud: solo al paquete de la app con su SHA-1 y solo a las APIs que usa.

## Archivos que no van en el repositorio

- `.env`, con tus valores reales.
- `android/app/google-services.json`: se descarga de Firebase (Configuración del proyecto → tu app Android). Sin él la app compila igual, pero sin notificaciones push.

`android/app/debug.keystore` sí está en el repositorio. Es la llave de depuración estándar de Android (clave `android`) y solo sirve para compilaciones de prueba. Una versión para publicar en Play Store necesita su propia llave, que nunca se sube.

## Nombre del paquete

La app se llama FleteYa, pero el paquete de Android sigue siendo `com.anonymous.InDriverReactNative`, porque Firebase y el inicio de sesión con Google están registrados con ese nombre. Se cambiará al preparar la versión para publicar, junto con un registro nuevo en Firebase y Google Cloud.

## Datos de prueba

- Cuentas: crea un cliente y un conductor desde la app y aprueba al conductor en el panel web del backend (`/admin`). Para usar dos cuentas a la vez, abre la app en el emulador y en un celular, o en dos emuladores.
- Pagos y ubicaciones de prueba: ver el [README del backend](https://github.com/AlejoLabs/FleteYa-Backend#datos-de-prueba).

## Probar un pago

Con el backend en modo de prueba, "Pagar por la app" abre una pasarela de prueba. Los datos que acepta están en el [README del backend](https://github.com/AlejoLabs/FleteYa-Backend#pagos-de-prueba). La tarjeta `4242 4242 4242 4242` aprueba.

## Licencia

[MIT](LICENSE) © 2026 Alejandro Beltrán
