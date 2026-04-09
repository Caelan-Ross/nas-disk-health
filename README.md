# nas-disk-health

A lightweight Docker container that serves a Scrutiny SMART disk health widget as an iframe for [Homepage](https://gethomepage.dev).

Displays passed, unknown, and failed drive counts based on raw SMART status — Scrutiny's own threshold failures are counted as passed.

<img width="440" height="230" alt="image" src="https://github.com/user-attachments/assets/1f5a1378-8e12-4d90-afcc-5131c08d9f51" />

## Requirements

- [Scrutiny](https://github.com/AnalogJ/scrutiny) running and accessible on your network
- Docker + Docker Compose
- Homepage dashboard

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Caelan-Ross/nas-disk-health.git
cd nas-disk-health
```

### 2. Configure

Edit `nginx.conf` and update the Scrutiny URL if yours differs from `http://truenas.home.arpa:31054`:

```nginx
location /api/summary {
    proxy_pass http://truenas.home.arpa:31054/api/summary;
    ...
}
```

Edit `docker-compose.yml` and update the DNS entry to point at your local DNS resolver (e.g. Pi-hole):

```yaml
dns:
  - 192.168.1.84
```

### 3. Deploy

```bash
docker compose up -d --build
```

Verify the proxy is working:

```bash
curl http://localhost:3002/api/summary
```

### 4. Add to Homepage

In your `services.yaml`:

```yaml
- NAS Monitoring:
    - Disk Health:
        href: "http://your-scrutiny-url"
        description: "S.M.A.R.T health monitoring for NAS disks."
        widget:
            type: iframe
            src: http://YOUR_SERVER_IP:3002
            classes: w-full h-28
            allowtransparency: true
```

Adjust `h-28` (112px) to taste — `h-24` (96px) or `h-32` (128px) are good alternatives depending on your layout.

## Status codes

| `device_status` | Meaning | Counted as |
|---|---|---|
| `0` | Passed SMART + Scrutiny | Passed |
| `1` | Failed raw SMART | Failed |
| `2` | Failed Scrutiny thresholds only | Passed |
| `3` | Failed both SMART and Scrutiny | Failed |
