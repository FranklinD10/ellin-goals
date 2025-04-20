export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
        scope: '/',
        updateViaCache: 'none' // Disable HTTP cache for service worker updates
      });

      // Set up periodic update checks every 30 minutes
      setInterval(async () => {
        try {
          const hasUpdate = await checkForUpdates();
          if (hasUpdate && registration.waiting) {
            // If an update is found, trigger the update notification
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        } catch (error) {
          console.error('Periodic update check failed:', error);
        }
      }, 30 * 60 * 1000);

      // Immediate first check
      registration.update().catch(error => {
        console.error('Initial update check failed:', error);
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // First check if there's already a waiting worker
      if (registration.waiting) {
        return true;
      }

      // Force an update check
      await registration.update();

      // Wait a moment for the updatefound event to fire if there is an update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if we have a new service worker waiting
      if (registration.waiting) {
        return true;
      }

      // Check if we're currently installing a new service worker
      if (registration.installing) {
        // Wait for the installation to complete
        await new Promise((resolve) => {
          const worker = registration.installing;
          if (!worker) {
            resolve(false);
            return;
          }

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed') {
              resolve(true);
            } else if (worker.state === 'redundant') {
              resolve(false);
            }
          });
        });

        // Check one final time for a waiting worker
        return registration.waiting !== null;
      }

      return false;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }
  return false;
};
