export class NotificationView {
    constructor() {
        this.button = document.getElementById('notif-bell-btn');
        this.bellOn = document.getElementById('bell-on');
        this.bellOff = document.getElementById('bell-off');
        this.dot = document.getElementById('notif-bell-dot');
    }

    bindToggle(handler) {
        if (this.button) {
            this.button.addEventListener('click', handler);
        }
    }

    updateButton(isSubscribed) {
        if (isSubscribed) {
            this.button.classList.add('active');
            this.bellOn.style.display = '';
            this.bellOff.style.display = 'none';
            this.dot.style.display = 'block';
            this.button.title = 'Nonaktifkan Notifikasi';
        } else {
            this.button.classList.remove('active');
            this.bellOn.style.display = 'none';
            this.bellOff.style.display = '';
            this.dot.style.display = 'none';
            this.button.title = 'Aktifkan Notifikasi';
        }
    }

    showMessage(message) {
        console.log(`[View] ${message}`);
        alert(message); // Atau gunakan popup custom
    }
}
