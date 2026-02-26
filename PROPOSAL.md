# Adavi ERP - Future Development Proposal

## 1. Inventory & Fabric Tracking
**Problem:** Currently, orders don't track fabric usage or stock levels.
**Solution:** Implement an inventory module to track fabric rolls, buttons, and threads.
*   **Features:** Stock levels, low stock alerts, link fabric usage to orders (e.g., "3 yards of Italian Wool").
*   **Benefit:** Prevents material shortages and calculates accurate COGS.

## 2. Appointment Scheduling
**Problem:** Client visits for measurements and trials are ad-hoc.
**Solution:** A calendar-based booking system for fittings and consultations.
*   **Features:** Calendar view, slot booking, SMS reminders to clients.
*   **Benefit:** Better time management for tailors and improved client experience.

## 3. Visual Measurement Guide (AI-Assisted)
**Problem:** Measurement entry is text-based and error-prone.
**Solution:** Interactive visual body map where users click a body part to enter data.
*   **Features:** SVG body overlay, visual cues for "how to measure", validation ranges.
*   **Benefit:** Reduces measurement errors and training time for new staff.

## 4. WhatsApp Integration for Notifications
**Problem:** Clients need manual updates on order status.
**Solution:** Automated WhatsApp messages via Twilio or Meta API.
*   **Features:** Auto-send "Order Received", "Ready for Trial", and "Delivered" messages.
*   **Benefit:** Proactive communication reduces client anxiety and phone calls.

## 5. Tailor Performance Analytics
**Problem:** No visibility into individual tailor productivity.
**Solution:** Advanced dashboard for "Manager" role showing output metrics.
*   **Features:** Orders completed per week, average turnaround time, alteration rate.
*   **Benefit:** Data-driven decisions for bonuses or training needs.

## 6. Digital Style Book & Sketchpad
**Problem:** Design sketches are offline or lost in chat.
**Solution:** A digital canvas attached to the order.
*   **Features:** Upload reference images, simple drawing tool (Canvas API) for sketching designs directly on the order.
*   **Benefit:** Centralizes design context and reduces "what did we agree on?" disputes.

## 7. Customer Portal
**Problem:** Clients have zero visibility into their order progress.
**Solution:** A lightweight, mobile-first public link for clients.
*   **Features:** View status timeline, upcoming appointments, and past order history.
*   **Benefit:** Increases transparency and trust.

## 8. QR Code Order Tags
**Problem:** Physical garments get mixed up in the workshop.
**Solution:** Generate printable QR tags for each order.
*   **Features:** Scan QR code with mobile phone to open the Order Detail page instantly.
*   **Benefit:** Rapid identification of garments on the rack.

## 9. Multi-Currency & Invoicing Enhancements
**Problem:** Basic invoicing doesn't handle partial payments or deposits well.
**Solution:** Robust finance module.
*   **Features:** Deposit tracking (e.g., 70% upfront), PDF invoice generation, expense tracking.
*   **Benefit:** Professional financial management and cash flow tracking.

## 10. Offline Mode (PWA)
**Problem:** Workshop internet can be spotty.
**Solution:** Enhance Vite config to fully support PWA capabilities with offline storage.
*   **Features:** Service workers for caching, local storage sync with Supabase when online.
*   **Benefit:** Uninterrupted work during connectivity issues.
