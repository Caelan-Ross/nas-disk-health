async function fetchHealth() {
  const elPassed  = document.getElementById('val-passed');
  const elUnknown = document.getElementById('val-unknown');
  const elFailed  = document.getElementById('val-failed');
  const elError   = document.getElementById('errorMsg');

  try {
    const res = await fetchWithRetry(
      '/api/summary',
      { headers: { 'Accept': 'application/json' } },
      { retries: 3, delay: 500, backoff: 2 }
    );

    const data = await res.json();
    const devices = Object.values(data?.data?.summary ?? {});

    let passed = 0, failed = 0, unknown = 0;

    for (const dev of devices) {
      const status = dev.device?.device_status;

      if (status === undefined || status === null) {
        unknown++;
      } else if (status === 1 || status === 3) {
        // 1 = failed raw SMART, 3 = failed both SMART and Scrutiny thresholds
        failed++;
      } else {
        // 0 = fully passed, 2 = failed Scrutiny thresholds only (SMART is fine)
        passed++;
      }
    }

    elPassed.textContent  = passed;
    elUnknown.textContent = unknown;
    elFailed.textContent  = failed;

  } catch (err) {
    if (elError) {
      elError.style.display = 'block';
      elError.textContent = `Error: ${err.message}`;
    }
    console.error('fetchHealth failed:', err);
  }
}

async function fetchWithRetry(url, options = {}, { retries = 3, delay = 500, backoff = 2 } = {}) {
  let attempt = 0;
  let currentDelay = delay;

  while (attempt < retries) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise(r => setTimeout(r, currentDelay));
      currentDelay *= backoff;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchHealth();
  setInterval(fetchHealth, 60000);
});

