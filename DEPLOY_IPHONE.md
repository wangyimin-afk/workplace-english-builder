# Run Workplace English Builder on iPhone Anywhere

This app is a static PWA. To use it outside the same Wi-Fi network, host these files on a public HTTPS static host.

## GitHub Pages Setup

Upload these files to a new GitHub repository:

- `index.html`
- `workplace_english_app.html`
- `manifest.webmanifest`
- `sw.js`
- `workplace-english-icon.svg`

Then enable GitHub Pages:

1. Open the repository on GitHub.
2. Go to Settings -> Pages.
3. Under "Build and deployment", choose:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /root
4. Save.
5. Wait about 1-3 minutes.

Your app URL will look like:

`https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

## iPhone Setup

After deployment, open the public HTTPS URL on iPhone Safari, then tap:

Share -> Add to Home Screen

The app will open like a normal iPhone app and cache itself for offline use after the first successful visit.

## Other Free Options

GitHub Pages is recommended if you already have GitHub. Netlify Drop is the easiest drag-and-drop fallback. Cloudflare Pages is also good but has more setup steps.

## Important

Keeping the Mac open at the company is not enough if the phone is outside the company network. A local Mac address such as `192.168.x.x` only works inside the same local network.

Avoid exposing the company Mac directly to the internet unless your company IT team approves it. Static hosting is safer for this app because the app does not need a backend.
