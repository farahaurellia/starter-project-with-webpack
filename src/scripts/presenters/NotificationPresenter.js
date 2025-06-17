import { NotificationModel } from '../models/notificationModel.js';
import { PushService } from '../service/pushService.js';

export class NotificationPresenter {
    constructor(view) {
        this.view = view;
        this.model = new NotificationModel();
        this.service = new PushService();
        this.token = '<auth_token_kamu>'; // nanti diganti dari login/auth
    }

    async init() {
        const currentSubscription = await this.service.getCurrentSubscription();
        this.model.setSubscription(currentSubscription);
        this.view.updateButton(this.model.isSubscribed());
        this.view.bindToggle(() => this.handleToggle());
    }

    async handleToggle() {
        if (this.model.isSubscribed()) {
            const endpoint = await this.service.unsubscribe();
            await this.service.deleteFromServer(endpoint, this.token);
            this.model.setSubscription(null);
            this.view.updateButton(false);
            this.view.showMessage("Notifikasi dimatikan.");
        } else {
            const subscription = await this.service.subscribe();
            await this.service.sendToServer(subscription, this.token);
            this.model.setSubscription(subscription);
            this.view.updateButton(true);
            this.view.showMessage("Notifikasi diaktifkan.");
        }
    }
}
