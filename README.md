🚑 MedAlert – Real-Time Emergency Dispatch System

MedAlert is a scalable real-time emergency response backend system built with NestJS.
It allows patients to request emergency medical assistance and automatically dispatches the nearest available medics using WebSockets and transactional safety.

🏗 Architecture
Gateway (WebSocket)
↓
DispatchService
↓
EmergencyService
↓
Prisma ORM
↓
PostgreSQL

Key Principles:

Clean layered architecture

Real-time event-driven design

Transactional race-condition protection

Scalable dispatch model

⚙️ Tech Stack

Framework: NestJS

Database: PostgreSQL

ORM: Prisma

Real-time: Socket.IO (WebSockets)

Queue (Planned): BullMQ

Cache / PubSub (Planned): Redis

Push Notifications (Planned): Firebase

🚨 Core Features (MVP)

1️⃣ Emergency Creation

Patient sends emergency request

Emergency record created immediately

Linked to patient and geolocation

2️⃣ Smart Medic Dispatch

Finds top 3 nearest available medics

Creates dispatch records

Sends real-time notifications

3️⃣ Race Condition Protection

First medic to accept wins

Transaction ensures single assignment

Other dispatches automatically cancelled

🔄 Dispatch Flow

Patient sends service_request

Emergency is created

Top 3 nearest medics selected

Dispatch records created

Medics notified via WebSocket

First medic to accept:

Emergency marked ASSIGNED

Other dispatches cancelled

🧠 Database Models

Emergency

- id
- reference
- patientId
- status (PENDING | ASSIGNED | COMPLETED)
- assignedMedicId
- locationLat
- locationLng

Dispatch

- id
- emergencyId
- medicId
- status (PENDING | ACCEPTED | CANCELLED | EXPIRED)

🛡 Scalability Plan

Redis Pub/Sub for horizontal scaling

BullMQ for dispatch timeout retries

PostGIS for optimized geospatial queries

Firebase fallback for offline medics

🚀 Running the Project
npm install
npx prisma migrate dev
npm run start:dev

📈 Future Enhancements

Dispatch timeout & auto-retry

Live medic tracking

Push notification fallback

Response time analytics

Admin dashboard

👨‍💻 Author

Oluwatosin Bayode

Backend Engineer | Real-Time Systems | Distributed Architecture
