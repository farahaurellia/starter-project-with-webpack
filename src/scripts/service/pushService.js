const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; // salin dari dokumentasi

export class PushService {
    async registerSW() {
        return await navigator.serviceWorker.register('/service-worker.js');
    }

    async subscribe() {
        const registration = await this.registerSW();
        return await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
    }

    async unsubscribe() {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            return subscription.endpoint;
        }
        return null;
    }

    async getCurrentSubscription() {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    }

    async sendToServer(subscription, token) {
        const body = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: this.encodeKey(subscription.getKey('p256dh')),
                auth: this.encodeKey(subscription.getKey('auth')),
            }
        };

        const response = await fetch('/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json(); // ✅ Tambahkan ini
        return result; // ✅ Kirim JSON hasil response ke Presenter
    }

    async deleteFromServer(endpoint, token) {
        return await fetch('/notifications/subscribe', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ endpoint })
        });
    }

    encodeKey(key) {
        return btoa(String.fromCharCode(...new Uint8Array(key)));
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
    }
}
