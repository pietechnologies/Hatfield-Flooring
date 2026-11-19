# Hatfield Flooring LLC

**Client demo:** run `python server.py` and open port 8080 (override with `PORT`). A successful final submission inserts a private SQLite entry and returns a reference. No email notification is sent. The database defaults to `~/.local/share/hatfield/quotes.sqlite3`, outside the public site. Override with `QUOTE_DB` on persistent private storage. Inspect locally with `sqlite3 ~/.local/share/hatfield/quotes.sqlite3 'SELECT * FROM quotes ORDER BY created DESC;'`. The sandbox inbox is for demos, not a permanent production CRM.

**GitHub Pages:** publish the folder containing index.html, app.js and assets. No build required. Pages cannot run Python; when no quote API is detected the final step points visitors to Hatfield’s CostCertified intake, linked from its Google profile, where they must enter and submit their information. No personal data is appended to the link. To keep intake entirely on-site, host the site with its API on a persistent server behind HTTPS with request limiting, access controls for staff, backups and an appropriate retention policy.

Photos and film are illustrative. The project guide uses curated answers plus optional browser-based intent classification. Before launch, confirm business details, list of services, and control of the linked intake with Bobby. The Google review count is a snapshot, not a live feed.
