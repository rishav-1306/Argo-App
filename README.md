# Argo App - Elevator Installation & Maintenance Management System

A lightweight, fast, and secure system for managing elevator maintenance.

## Project Structure

- `backend/`: Node.js & Express.js API
- `admin-dashboard/`: React.js Web Dashboard
- `mobile-app/`: React Native (Expo) Mobile App

## Setup Instructions

### 1. Backend
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` and fill in your Google Sheets credentials and JWT secret.
4. `npm start`

### 2. Admin Dashboard
1. `cd admin-dashboard`
2. `npm install`
3. `npm start`

### 3. Mobile App
1. `cd mobile-app`
2. `npm install`
3. `npx expo start`

## Google Sheets Structure
Ensure your Google Sheet has the following sheets with headers:
- `Customers`: `customerId, name, phone, email, passwordHash, address`
- `Elevators`: `elevatorId, customerId, elevatorCode, location, installationDate, warrantyExpiry, lastMaintenance, nextMaintenance, status`
- `Maintenance`: `maintenanceId, elevatorId, serviceDate, nextServiceDate, remarks, technicianName`
- `ServiceRequests`: `requestId, customerId, elevatorId, issue, status, createdAt`
- `AdminUsers`: `adminId, email, passwordHash`

## Features
- JWT Authentication & RBAC
- Google Sheets as Database
- Automatic Maintenance Reminders (Daily Cron Job)
- Minimal & Modern UI with Montserrat font
