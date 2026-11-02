# Redro Food Stock

A mobile-first, local-first food inventory and expiry tracker.

## Current features
- Add, edit, search, filter and delete inventory items.
- Organize items by Fridge, Freezer and Pantry, with shelf or area locations.
- Review expired and soon-to-expire items in a restock list and copy or download it.
- Record quantity, unit, created/prepared date, expiry date and notes.
- Automatic date-based freshness labels.
- Local persistence with IndexedDB.
- Export a complete JSON backup.
- Import a backup by merging or replacing current records.
- Print the complete inventory as PDF, independent of the current location or filters.
- Export inventory snapshots as PNG (up to 200 items per image).
- Installable offline PWA with a service worker.

## Run locally
Serve this folder through a local static web server, or publish it with GitHub Pages. IndexedDB and service workers require a supported browser context; service-worker installation requires HTTPS or localhost.

## Privacy
Inventory records stay in the browser's local database. Clearing browser site data can erase them, so export backups regularly. JSON backups contain the inventory data and should be stored securely.

## Food safety
Freshness labels are calculated from the entered dates only. They do not determine whether food is safe to consume. Follow applicable food-safety guidance and storage requirements.

## PDF
Choose **Export PDF**, then use the browser or device print dialog and select **Save as PDF** when available.
