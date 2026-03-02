# IUT Cafeteria Rush

IUT Cafeteria Rush is a microservice-based food ordering system built for DevSprint 2026 by IUT Computer Society. The system solves a real problem — during Ramadan Iftar rush, hundreds of students try to order food at the same time, which crashes the old monolithic system. This project breaks the system into 5 small independent services so that even if one part is under heavy load, the rest keep working fine.

---

## Problem It Solves

Every Ramadan at IUT, the cafeteria ordering system crashes right at Iftar time because too many students place orders simultaneously. Orders get lost, stock goes negative, and students end up waiting with no idea what happened to their food. IUT Cafeteria Rush fixes this by using microservices, Redis caching, optimistic locking, and real-time WebSocket notifications.

---

## Architecture Overview

┌─────────────────────────────────────────────────────────────────┐
│                    IUT Cafeteria Rush                           │
│                    Architecture Diagram                         │
└─────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   student.html  │
                              │   (Browser)     │
                              └────────┬────────┘
                                       │
                                       │ WebSocket (实时更新)
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │  Notification    │◄────────►│    RabbitMQ      │             │
│  │  Hub (3005)      │          │    (5672)        │             │
│  └────────┬─────────┘          └────────┬─────────┘             │
│           │                             │                       │
│           │                             │                       │
│           │                     ┌───────▼────────┐              │
│           │                     │  Kitchen Queue │              │
│           │                     │    (3004)      │              │
│           │                     └───────┬────────┘              │
│           │                             │                       │
│           └─────────────────────────────┘                       │
│                        (RabbitMQ)                               │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │  Order Gateway   │                         │
│                    │    (3002)        │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│                             │                                   │
│                    ┌────────▼─────────┐                         │
│                    │   Stock Service  │                         │
│                    │     (3003)       │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│                    ┌────────▼─────────┐    ┌──────────────────┐ │
│                    │   PostgreSQL     │    │     Redis        │ │
│                    │   (5432)         │    │   (6379)         │ │
│                    └──────────────────┘    └──────────────────┘ │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │    Identity      │                         │
│                    │   Provider (3001)│                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│                    ┌────────▼─────────┐                         │
│                    │   Student Login  │                         │
│                    │   (Browser)      │                         │
│                    └──────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         Service Ports:                          │
│   ┌────────────────────┬──────────┬─────────────────────────┐   │
│   │ Service Name       │ Port     │ Description             │   │
│   ├────────────────────┼──────────┼─────────────────────────┤   │
│   │ Identity Provider  │ 3001     │ Login & JWT generation  │   │
│   │ Order Gateway      │ 3002     │ Main entry for orders   │   │
│   │ Stock Service      │ 3003     │ Inventory management    │   │
│   │ Kitchen Queue      │ 3004     │ Cooking pipeline        │   │
│   │ Notification Hub   │ 3005     │ WebSocket updates       │   │
│   │ PostgreSQL         │ 5432     │ Main database           │   │
│   │ Redis              │ 6379     │ Cache for stock         │   │
│   │ RabbitMQ           │ 5672     │ Message queue           │   │
│   │ RabbitMQ Management│ 15672    │ Admin UI (guest/guest)  │   │
│   └────────────────────┴──────────┴─────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Request Flow:                              │
│                                                                 │
│   1. Student logs in → Identity Provider → JWT Token            │
│   2. Student places order → Order Gateway                       │
│   3. Gateway checks Redis cache for stock                       │
│   4. Stock Service deducts from PostgreSQL                      │
│   5. Order sent to Kitchen Queue                                │
│   6. Kitchen sends update to RabbitMQ                           │
│   7. Notification Hub gets update from RabbitMQ                 │
│   8. WebSocket pushes update to student.html                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Data Flow:                                 │
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐                   │
│   │ Browser │────▶│ Gateway │────▶│ Stock   │────▶ PostgreSQL │
│   └─────────┘     └─────────┘     └─────────┘                   │
│       ▲               │               │                         │
│       │               │               │                         │
│       │               ▼               ▼                         │
│       │           ┌─────────┐     ┌─────────┐                   │
│       └───────────│ Notifier│◀────│ Kitchen │                  │
│                   └─────────┘     └─────────┘                   │
│                        │              │                         │
│                        │              │                         │
│                        ▼              ▼                         │
│                   ┌─────────────────────────┐                   │
│                   │       RabbitMQ          │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘



## Features

- Student login with JWT authentication
- Rate limiting on login — max 3 attempts per minute
- Redis cache check before touching database
- Optimistic locking to prevent overselling during rush
- Real-time order status updates via WebSocket
- 4-step order tracking: Pending, Stock Verified, In Kitchen, Ready
- Admin dashboard with