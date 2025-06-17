export class NotificationModel {
    constructor() {
        this.subscribed = false;
        this.endpoint = null;
    }

    setSubscription(subscription) {
        this.subscribed = !!subscription;
        this.endpoint = subscription?.endpoint || null;
    }

    isSubscribed() {
        return this.subscribed;
    }

    getEndpoint() {
        return this.endpoint;
    }
}
