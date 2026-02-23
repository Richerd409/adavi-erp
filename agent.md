# Adavi – Boutique Luxury Tailoring ERP

## Project Overview

Adavi is an internal ERP system for a boutique tailoring workshop.
It is not customer-facing.

Roles:
- Admin
- Manager
- Tailor

Workshop type:
- Single workshop
- 2–4 tailors
- Boutique luxury positioning

The system integrates with Supabase backend and enforces strict role-based access and workflow control.

---

# Backend Architecture (Already Implemented)

## Supabase Tables

### 1. public.users
- id (uuid, linked to auth.users)
- name (text)
- role (admin | manager | tailor)
- created_at (timestamp)

Auto-created via trigger on signup.

---

### 2. public.orders
- id (uuid)
- client_name
- phone
- garment_type
- delivery_date
- status
- assigned_tailor_id
- measurement_id
- notes
- created_at

Includes:
- RLS policies
- State machine enforcement trigger

---

### 3. public.measurements
- id
- client_name
- phone
- chest
- waist
- hip
- shoulder
- sleeve_length
- top_length
- notes
- created_at

Accessible only to admin and manager.

---

# Order Status State Machine

Valid transitions only:

New → In Progress → Trial → Alteration → Completed → Delivered

Rules:
- No skipping steps
- No backward invalid transitions
- Enforced at database level

Frontend must respect this logic.

---

# Security Model

Row Level Security (RLS) enabled.

Admin:
- Full access

Manager:
- Can create & update orders
- Can manage measurements

Tailor:
- Can only see assigned orders
- Can only update their assigned orders

No cross-role data leakage allowed.

---

# Frontend Requirements

## Framework
React-based application integrated with Supabase client.

## Protected Routes
All /app routes require authentication.

Role-based redirection:
- admin → full system
- manager → operations
- tailor → limited view

---

# UI Design Direction

Theme: Boutique Luxury

Style:
- Minimal
- Elegant
- Fashion-focused
- Neutral tones (beige, ivory, charcoal)
- Muted gold accents
- Soft shadows
- Rounded corners
- Spacious layout

No industrial dashboard style.

---

# Application Structure

Routes:

/login  
/app/dashboard  
/app/orders  
/app/orders/[id]  
/app/measurements  
/app/users (admin only)

---

# Core Modules

## Dashboard
Admin & Manager:
- KPI cards
- Kanban board by status

Tailor:
- Assigned orders only

---

## Orders
- List view
- Filter by status
- Search by client name or phone
- Tailor assignment (admin/manager only)
- Status update respecting state machine

---

## Measurements
- Searchable list
- Create / edit form
- Linked to orders

---

## Users (Admin only)
- View all users
- Change roles

---

# Development Standards

- Use modular components
- Separate layout and page components
- Use Supabase client for all DB interaction
- Handle database errors gracefully
- Respect backend RLS
- Respect order state machine

---

# Goal

Build a clean, secure, scalable boutique ERP system
ready for real workshop operations.
