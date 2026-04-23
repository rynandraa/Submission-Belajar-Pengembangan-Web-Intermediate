import { StoryApi } from '../data/api';

const PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushManager = {
  async getSubscription() {
    if (!('serviceWorker' in navigator)) return null;
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.pushManager) return null;
      return await registration.pushManager.getSubscription();
    } catch (err) {
      console.error('Error getting push subscription:', err);
      return null;
    }
  },

  async subscribe() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker tidak didukung di browser ini.');
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      throw new Error('Push Manager tidak didukung di browser ini.');
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi ditolak. Harap aktifkan izin di pengaturan browser Anda.');
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(PUBLIC_KEY)
      });

      // Send subscription to backend
      await StoryApi.subscribeNotification(subscription);
      console.log('Push Notification Subscribed and sent to server');
      return subscription;
    } catch (err) {
      console.error('Gagal melakukan subscribe push notification:', err);
      throw err;
    }
  },

  async unsubscribe() {
    try {
      const subscription = await this.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push Notification Unsubscribed');
        return true;
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
    }
    return false;
  }
};
