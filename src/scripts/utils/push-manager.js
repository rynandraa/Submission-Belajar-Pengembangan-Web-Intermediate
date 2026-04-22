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
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) return null;
    return await registration.pushManager.getSubscription();
  },

  async subscribe() {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    
    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notifikasi tidak diizinkan oleh pengguna.');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(PUBLIC_KEY)
    });

    // In a real app, send subscription to backend.
    // For this dicoding task, we just need to subscribe and log it
    console.log('Push Notification Subscribed:', JSON.stringify(subscription));
    return subscription;
  },

  async unsubscribe() {
    const subscription = await this.getSubscription();
    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('Push Notification Unsubscribed');
      return result;
    }
    return false;
  }
};
