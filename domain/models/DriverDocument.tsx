// Estado de un documento del conductor (GET /driver-car-info/me/documents). EXPIRING = vence en 30 días o menos
export interface DriverDocument {
    key: 'LICENSE' | 'SOAT' | 'TECHNO';
    label: string;
    expires_at: string;
    days_left: number;
    status: 'OK' | 'EXPIRING' | 'EXPIRED';
}
