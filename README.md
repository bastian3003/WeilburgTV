# Weilburg-TV – Website

Statische, responsive Website für Weilburg-TV / Lahntal-Fernsehen. Die Inhalte stammen von
https://www.bad-records.de/weilburginfo-neu/ (inkl. Unterseiten).

## Aufbau

- `*.html` – die einzelnen Seiten (Startseite, Sendungen, Kultur, Werbung, Kontakt/Impressum)
- `assets/css/style.css` – Gestaltung
- `assets/js/main.js` – Navigation, Video-Vorschauen, Galerien, Lightbox
- `assets/img/` – Bilder, `assets/dokumente/` – Exposés und Treatment

Kein Build-Schritt nötig: Dateien auf einen beliebigen Webserver kopieren.
Lokal ansehen: `python3 -m http.server` im Projektordner, dann http://localhost:8000 öffnen.

## Videos

Videos von Vimeo und YouTube werden erst beim Klick auf das Vorschaubild eingebettet
(YouTube über `youtube-nocookie.com`, Vimeo mit `dnt=1`). Vorschaubilder und Titel werden
beim Scrollen über die oEmbed-Schnittstellen der Anbieter nachgeladen.

Neue Videos ergänzen: In der jeweiligen Seite die Video-ID im Attribut `data-ids` einer
`video-gallery` vorne anfügen, oder eine einzelne Karte einfügen:

```html
<figure class="video-card" data-provider="vimeo" data-id="123456789">
  <figcaption><strong>Titel</strong></figcaption>
</figure>
```
