// CSS imports
import '../styles/styles.css';
import App from './pages/app';
import Model from '../models/model';
import Presenter from './presenters/presenter';

document.addEventListener('DOMContentLoaded', async () => {

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  // Hamburger menu logic (tetap)
  const drawerButton = document.getElementById('drawer-button');
  const navList = document.getElementById('nav-list');

  function handleResize() {
    if (window.innerWidth <= 800) {
      drawerButton.style.display = 'block';
      navList.classList.remove('open');
    } else {
      drawerButton.style.display = 'none';
      navList.classList.remove('open');
    }
  }
  handleResize();
  window.addEventListener('resize', handleResize);

  drawerButton.addEventListener('click', (e) => {
    e.stopPropagation(); // agar tidak langsung tertutup oleh event document
    navList.classList.toggle('open');
    console.log('Hamburger clicked, nav-list class:', navList.className);
  });

  document.addEventListener('click', (e) => {
    if (
      window.innerWidth <= 800 &&
      !navList.contains(e.target) &&
      !drawerButton.contains(e.target)
    ) {
      navList.classList.remove('open');
    }
  });

  // === Notification Bell Logic ===
  const notifBtn = document.getElementById('notif-bell-btn');
  const bellOn = document.getElementById('bell-on');
  const bellOff = document.getElementById('bell-off');
  const notifDot = document.getElementById('notif-bell-dot');
  let isSubscribed = false;
  let subscription = null;
  const model = new Model();
  const presenter = new Presenter(null, model);

  function updateBellUI(subscribed) {
    if (subscribed) {
      notifBtn.classList.add('active');
      bellOn.style.display = '';
      bellOff.style.display = 'none';
      notifDot.style.display = 'block';
      notifBtn.title = 'Nonaktifkan Notifikasi';
    } else {
      notifBtn.classList.remove('active');
      bellOn.style.display = 'none';
      bellOff.style.display = '';
      notifDot.style.display = 'none';
      notifBtn.title = 'Aktifkan Notifikasi';
    }
  }

  async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        subscription = await reg.pushManager.getSubscription();
        isSubscribed = !!subscription;
        updateBellUI(isSubscribed);
      }
    }
  }

  async function subscribeNotif() {
    try {
      console.log('Preparing to subscribe to PushManager...');
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('PushManager subscription success:', sub);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Anda harus login untuk mengaktifkan notifikasi.');
      }
      const result = await presenter.handleSubscribeNotification(
        token,
        sub.endpoint,
        sub.toJSON().keys
      );

      console.log('[RESPONSE] Push subscription response:', result);

      isSubscribed = true;
      subscription = sub;
      updateBellUI(true);
    } catch (err) {
      console.error('Subscribe error:', err);
      const notifPopup = new NotificationView();
      notifPopup.show({
        title: 'Gagal Subscribe!',
        message: err.message || 'Tidak dapat mengaktifkan notifikasi.',
      });
    }
  }

  async function unsubscribeNotif() {
    try {
      console.log('Preparing to unsubscribe from PushManager...');
      if (subscription) {
        await subscription.unsubscribe();
        const token = localStorage.getItem('token');
        await model.unsubscribeNotification({
          token,
          endpoint: subscription.endpoint,
        });
        console.log('Unsubscribed from PushManager and API.');
      }
      isSubscribed = false;
      updateBellUI(false);
    } catch (err) {
      console.error('Unsubscribe error:', err);
      const notifPopup = new NotificationView();
      notifPopup.show({
        title: 'Gagal Unsubscribe!',
        message: err.message || 'Tidak dapat menonaktifkan notifikasi.',
      });
    }
  }

  if (notifBtn) {
    notifBtn.addEventListener('click', async () => {
      console.log('Bell button clicked. isSubscribed:', isSubscribed);
      if (isSubscribed) {
        console.log('Unsubscribing from notification...');
        await unsubscribeNotif();
        console.log('Unsubscribe process finished.');
      } else {
        console.log('Subscribing to notification...');
        await subscribeNotif();
        console.log('Subscribe process finished.');
      }
    });
    checkSubscription();
  }

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

// Helper untuk konversi VAPID key
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
