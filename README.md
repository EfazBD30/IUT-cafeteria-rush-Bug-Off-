# IUT Cafeteria Rush

IUT Cafeteria Rush is a microservice-based food ordering system built for DevSprint 2026 by IUT Computer Society. The system solves a real problem — during Ramadan Iftar rush, hundreds of students try to order food at the same time, which crashes the old monolithic system. This project breaks the system into 5 small independent services so that even if one part is under heavy load, the rest keep working fine.

---

## Problem It Solves

Every Ramadan at IUT, the cafeteria ordering system crashes right at Iftar time because too many students place orders simultaneously. Orders get lost, stock goes negative, and students end up waiting with no idea what happened to their food. IUT Cafeteria Rush fixes this by using microservices, Redis caching, optimistic locking, and real-time WebSocket notifications.

---

## Architecture Overview

Student Browser
      |
      v
Identity Provider  (Login, JWT Token - Port 3001)
      |
      | JWT Token
      v
Order Gateway (Port 3002) -----> Stock Service (PostgreSQL + Redis - Port 3003)
      |
      v
Kitchen Queue (Port 3004) -----> Notification Hub (WebSocket - Port 3005)
      |                                   |
      |------- RabbitMQ ----------------->|
                                          v
                                   Student Browser
                                   (Real-time updates)

---

## Features

- Student login with JWT authentication
- Rate limiting on login — max 3 attempts per minute
- Redis cache check before touching database
- Optimistic locking to prevent overselling during rush
- Real-time order status updates via WebSocket
- 4-step order tracking: Pending, Stock Verified, In Kitchen, Ready
- Admin dashboard with