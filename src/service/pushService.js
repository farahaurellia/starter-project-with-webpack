export class PushService {
    async getCurrentSubscription() {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            return await reg.pushManager.getSubscription();
        }
        return null;
    }

    async subscribe() {
        const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r21CnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
        const reg = await navigator.serviceWorker.ready;
        return await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
    }

    async unsubscribe() {
        const subscription = await this.getCurrentSubscription();
        if (subscription) {
            const endpoint = subscription.endpoint;
            await subscription.unsubscribe();
            return endpoint;
        }
        return null;
    }

    async sendToServer(subscription, token) {
        const keys = subscription.toJSON().keys;
        const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                },
            }),
        });
        return response.json();
    }

    async deleteFromServer(endpoint, token) {
        const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                endpoint,
            }),
        });
        return response.json();
    }
}

// Helper function
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}