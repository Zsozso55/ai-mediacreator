# AI MEDIA CREATOR — website

Static site, generator-driven. No framework, deploys to Vercel as-is.
The Nova assistant still calls your existing /api/chat serverless function.

## How it's built (the "one source of truth" part)
You do NOT edit the 6 HTML files by hand. They are GENERATED.

- `gen_ai.py`  → defines the header, footer, <head> and Nova widget ONCE,
                 plus each page's content. Run it to rebuild every page:
                     python3 gen_ai.py
- `styles.css` → all design + colours, in one place (tokens at the top, :root).
- `app.js`     → Nova chat, mobile menu, hero video, lazy video loading.

Change the menu, footer or colours once, run the generator, every page updates.
(This is the same approach as the GVP site.)

## Colours
Sampled from your brand videos: deep navy base (#060e1c) + luminous
cyan/teal accents (#56bed9 / #3b8db2). Edit them in :root in styles.css.

## Video SEO fixes baked in
- Poster images for every video (assets/*-poster.jpg) — Google needs a thumbnail.
- VideoObject structured data on the Services page (4 showreels).
- Logo + favicon set generated from your Grok assets (assets/mark.png, favicon.*, apple-touch).
- A video sitemap (<video:video> entries) in sitemap.xml.
- Background showreel is decorative: muted autoplay (reliable), preload=metadata.
- Showreel videos lazy-load only when scrolled into view (faster, better Core Web Vitals).

## Deploy
Drag the whole folder onto Vercel (or `vercel --prod`). Keep your /api/chat function.
robots.txt + sitemap.xml use lowercase filenames — re-submit sitemap.xml in Search Console.
