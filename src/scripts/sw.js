// sw.js
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Notifikasi';
  const options = data.options || { body: '' };
  event.waitUntil(
    (async () => {
      // Tampilkan native notification
      await self.registration.showNotification(title, options);
      // Kirim ke semua client (tab) yang aktif
      const allClients = await clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ title, options });
      }
    })()
  );
});