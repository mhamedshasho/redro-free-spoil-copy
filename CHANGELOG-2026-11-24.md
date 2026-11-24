# Redro Food Stock — Change Report

## Expiry notifications
- Replaced the previous generic reminder with three scheduled events per item: three days before expiry, two days before expiry, and the expiry date.
- Notification text includes the item name and remaining time.
- Removed notification creation for item deletion and other administrative actions.
- Changing an item's name or expiry date refreshes its pending reminders.
- Existing reminders are cancelled when the item is removed or its expiry details change.

## Inventory search and sorting
- Added sorting by nearest expiry, farthest expiry, name ascending/descending, quantity ascending/descending, and most recently updated.
- Sorting is applied after the current location, group, status, and search filters.

## Layout and rendering
- Improved the mobile inventory toolbar and sort control layout.
- Added contained rendering hints and subtle interaction feedback for inventory cards.

## Verification status
- Source changes are committed.
- A successful Android build and on-device notification delivery still need to be verified after this change.
- Notification delivery time depends on Android notification permission, battery restrictions, and device scheduling behavior.
