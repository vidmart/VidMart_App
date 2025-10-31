# VidMart Architecture Overview

## System Architecture

The VidMart platform integrates **React.js frontend**, **Node.js/Express backend**, **Supabase**, and **Algorand blockchain** to enable secure, transparent, and verifiable order and reward management for both B2C and B2B operations.

### 🧩 B2C Architecture

![B2C Architecture](./B2C.png)

#### Explanation:

This diagram illustrates the **Business-to-Consumer (B2C)** flow:

- **Frontend (React, deployed on Vercel)** provides interfaces for customers, delivery personnel, and support staff.
- **Backend (Node.js/Express)** handles order tracking, inventory management, and wallet operations.
- **Supabase** manages authentication, database storage, and serverless functions.
- **Algorand Blockchain** is used for **token minting/redemption** and secure transaction verification.
- **Payment Gateway** handles payment status and token redemption.
- A **Blockchain Interaction Module** bridges backend services with blockchain smart contracts for wallet updates and token rewards.

---

### 🏪 B2B Architecture (VidMart Delivery Verification)

![B2B Architecture](<./B2B.png>)

#### Explanation:

This diagram represents the **Business-to-Business (B2B)** verification system:

- The **Application layer** includes Web (React.js), Mobile (React Native), and API (Node.js/Express).
- The **Backend** communicates with the **Blockchain layer**, which hosts **Smart Contracts** and **Delivery Verification** logic.
- **Supabase** manages authentication, order data, and confirmation tracking.
- **Users** such as Kirana Stores, Distributors, and VidMart Delivery Teams interact with the system to verify deliveries using blockchain-validated confirmations.

## 🧠 Tech Stack

This project is built using:

- **Vite**
- **TypeScript**
- **React**
- **shadcn-ui**
- **Tailwind CSS**
- **Supabase (Auth, Database, Functions)**
- **Algorand Blockchain**
- **Node.js / Express**
