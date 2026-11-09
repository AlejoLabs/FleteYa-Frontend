import { t, currentLocale } from '../../i18n';
// Un número con el separador de miles y de decimales del idioma que se está usando
export const formatNumber = (value: number, maxDecimals = 2, minDecimals = 0): string =>
  value.toLocaleString(currentLocale(), { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals });

export const formatCOP = (value?: number | null): string => {
  const amount = typeof value === 'number' && !isNaN(value) ? value : 0;
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Solo los dígitos, con punto de miles, para un campo de pesos mientras se escribe ("1500000" → "1.500.000")
export const formatThousands = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Kilómetros a "8,8 km", con coma decimal como en Colombia (Google la manda con punto)
export const formatKm = (km: number): string =>
  `${formatNumber(km, 1, 1)} km`;

export const formatTripDate =(value?: string | Date | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(currentLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Hora de un mensaje, por ejemplo "3:05 p. m."
export const formatTime = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(currentLocale(), { hour: 'numeric', minute: '2-digit' });
}

// Calificación de un usuario, por ejemplo "★ 4.6 (12)"; sin votos todavía sale "Nuevo"
export const formatRating = (rating?: { average: number | null; count: number } | null): string =>
  rating && rating.average !== null ? `★ ${rating.average.toFixed(1)} (${rating.count})` : t('formatters.nuevo');

// Tiempo restante de una búsqueda, por ejemplo "9:05"
export const formatCountdown = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Fecha de un flete programado, por ejemplo "jue 30 oct, 8:00 a. m."
export const formatScheduledDate = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(currentLocale(), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

// El backend puede devolver un mensaje o una lista (varios campos inválidos a la vez)
export const formatErrorMessage = (message: string | string[]): string =>
  Array.isArray(message) ? message.join('\n') : message;

// El valor del viaje es el acordado al aceptar una oferta; mientras no haya, se muestra la oferta del cliente
export const getTripFare = (clientRequest: { fare_offered: number; fare_assigned?: number | null }): number =>
  clientRequest.fare_assigned ?? clientRequest.fare_offered;

// ISO a DD/MM/AAAA, para llenar un campo de fecha con lo que ya está guardado
export const formatDayMonthYear = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Fecha escrita como DD/MM/AAAA; devuelve ISO (fin del día) o null si no es una fecha real
export const parseDayMonthYear = (value: string): string | null => {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, 23, 59, 59);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date.toISOString();
}
