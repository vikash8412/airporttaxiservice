# Airport Taxi Service — airporttaxiservice.in

Marketing site for a Bangalore airport taxi and outstation cab service. Static
HTML/CSS/JS, no build step. Live fares and bookings are handled by an embedded
AI assistant (chatbot) served by NammaTaxi; the site itself just presents the
service and routes the user to that assistant or the phone.

## Tech

- Plain HTML pages, one file per route (no framework, no bundler).
- [Bootstrap 5.3](https://getbootstrap.com/) + Bootstrap Icons via CDN.
- Shared header, footer and the "posts" (route guides) list are injected at
  runtime by [`assets/js/site.js`](assets/js/site.js).
- Site-wide values (phone, WhatsApp, API base) live in
  [`assets/js/config.js`](assets/js/config.js) as `window.ATS`.
- Route guides ("blog") are fetched from the NammaTaxi posts API at request time.
- AI booking assistant is loaded from `https://nammataxi.com/embed/chatbot.js`.

## Project layout

```
.
├── index.html                    Home
├── airport.html                  Airport taxi (hub)
├── airport-pickup.html           Airport → city
├── airport-drop.html             City → airport
├── airport-round-trip.html       Pickup, wait & return
├── outstation.html               Outstation cabs (hub)
├── outstation-one-way.html       One-way outstation
├── outstation-round-trip.html    Round-trip outstation
├── tour-packages.html            Hourly / full-day sightseeing
├── blog.html                     Route & travel guides (list, from API)
├── post.html                     Single guide (?slug=…, from API)
├── contact.html                  Phone / WhatsApp / assistant
├── 404.html                      Error page (ErrorDocument)
├── robots.txt
├── sitemap.xml                   Clean URLs, no .html
├── site.webmanifest             PWA manifest
├── .htaccess                     Clean URLs, MIME types, caching, gzip
└── assets/
    ├── css/style.css            All site styling (brand tokens at top)
    ├── js/config.js             window.ATS — phone, WhatsApp, API base, brand
    ├── js/site.js               Header/footer injection, posts API, ATSsite.bookNow()
    └── img/                     Favicons + apple-touch-icon
```

## Local development

Any static file server works, but the clean-URL rules and error page need
Apache with `mod_rewrite`, so testing against Apache is closest to production:

```bash
# quick, without .htaccess (links still work; /page.html won't redirect)
python3 -m http.server 8000        # then open http://localhost:8000

# with .htaccess behaviour
# point an Apache vhost DocumentRoot at this folder with `AllowOverride All`
```

The AI assistant and the route-guide list call `https://nammataxi.com`; both
degrade gracefully when that host is unreachable (the guide list shows a
fallback message, the assistant simply doesn't appear).

## Clean URLs

Pages are linked without the `.html` extension (`/airport-pickup`, not
`/airport-pickup.html`). [`.htaccess`](.htaccess):

- serves `/<page>` from `<page>.html` internally, and
- 301-redirects any `/<page>.html` (and `/index.html`) to the clean form.

Keep new internal links extensionless and add the page to
[`sitemap.xml`](sitemap.xml).

## Common edits

| Change | Where |
| --- | --- |
| Phone number | `assets/js/config.js` (`phone`, `phoneDisplay`) — also the `tel:` links and JSON-LD `telephone` inside each `*.html` |
| WhatsApp number | `assets/js/config.js` (`whatsapp`) and the `wa.me/…` link in `contact.html` |
| Nav / footer links, top bar | `assets/js/site.js` (`nav()` / `foot()`) |
| Brand colours, hero, buttons | `assets/css/style.css` (`:root` tokens: `--navy`, `--gold`) |
| Hero banner on a page | the `<header class="hero hero-inner">` block near the top of that `*.html` |
| Open the AI assistant from a button | add `data-book-now` to the element, or call `ATSsite.bookNow()` |

## Deployment

Upload the repository contents to the web root of `airporttaxiservice.in`
(Apache, PHP host — PHP is not used, but `.htaccess` is). No build, no
environment variables. After deploy, sanity-check:

- `/` and each clean URL return `200`
- `/index.html` and `/<page>.html` 301 to the clean URL
- an unknown path renders `404.html`
- the favicon and the AI assistant launcher both load
