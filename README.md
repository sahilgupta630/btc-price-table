# Bitcoin Price Tracker (Find Cheapest BTC)

A full-stack web application designed to help users find the cheapest Bitcoin (BTC) purchasing options across multiple popular crypto exchanges for a generic USD amount. The tracker fetches real-time quotes, calculates the amount of BTC you will get from each provider, and displays them ranked via a clean, modern UI.

## 🚀 Features

- **Real-time Price Comparison:** Checks real-time exchange rates across multiple major fiat-to-crypto providers:
  - Paybis
  - Guardarian
  - MoonPay
  - Transak
- **Smart Backend Caching:** Built-in resilient local Express backend that gracefully falls back to intelligent cache calculation if the upstream crypto exchange APIs block requests or time out for excessive requests.
- **Dynamic User Interface:** Fully responsive UI styled seamlessly using **Tailwind CSS**, featuring aesthetic skeleton loaders and error-state logo fallbacks.

## 🛠 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend Proxy Server:** Node.js + Express
- **Package Manager:** NPM

## ⚙️ Local Setup and Configuration

Follow these steps to get the application running on your local machine.

### Prerequisites
Make sure you have Node.js and NPM installed on your machine.

### 1. Installation
Clone the repository and install the required dependencies:

```bash
# Clone the repository
git clone https://github.com/sahilgupta630/btc-price-table.git

# Navigate into the project folder
cd btc-price-table

# Install all NodeJS dependencies
npm install
```

### 2. Running Locally

This project uses `concurrently` to effortlessly run both the Vite React Development server and the local Express proxy backend at the exact same time through a single command.

```bash
# Start both the frontend and backend servers
npm run dev
```

- **Frontend Application:** `http://localhost:5173/`
- **Backend API Server:** `http://localhost:3001/`

### 3. Usage
- Simply type in your desired buying amount in **USD** in the central input box.
- The system checks the rate differences in 300ms intervals (using a debouncer).
- An ordered list will populate displaying how much `BTC` you will get for your investment, ranking the highest payouts (cheapest rates) at the top!

## 🔧 Architecture & Backend Fixes

Originally connected to a defunct `AirCode` serverless backend, this project has been fully migrated to use an internal local Express API (`server.js`). 

The `server.js` node instance is required because crypto exchanges often heavily restrict or block standard un-authenticated web-client API requests due to extreme CORS protections. The NodeJS backend circumvents this securely. By using strict timeouts (`2000ms`), the application guarantees a highly responsive interface that will never hang infinitely, instead displaying estimated local scalable rate values if external services randomly crash.