# 🤖 Admin AI Assistant - Retail Automation & AI Extraction

[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-success)](https://adminaiassistant.vercel.app/)
[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2014%20|%20Supabase%20|%20Gemini%20AI-blue)](https://adminaiassistant.vercel.app/)

> **Solving manual data entry with AI.** Automating Stock Opname and Invoice processing with a Human-in-the-Loop validation system.

## 🌟 Executive Summary

This application is designed to cut down repetitive retail administrative work time. With AI integration, the system can "read" shelf photos (stock opname), shopping receipts (invoices), and even WhatsApp sales screenshots, then automatically convert them into digital data.

- **Impact:** Reduces data entry time by up to 80%.
- **Reliability:** Interactive user verification system for validation before entering the database.

---

## 🛠️ Technical Deep Dive

This system uses a modern architecture 

- **Frontend:** Next.js 16 (TypeScript)
- **AI Engine:** Google Gemini 2.5 Vision untuk OCR (Optical Character Recognition) and context-based Entity Extraction.
- **Database & Auth:** Supabase dan Goggle OAuth
- **Logic:** Implementation of Contextual Text Recovery—Gemini AI is able to predict blurred/cut-off text (example: "ind mi" to "Indomie") based on data I have tested.

---

## 🚀 Key Features & User Workflow

1. **Secure Authentication:** Fast and secure login using Google OAuth.
2. **AI Stock Opname:** User takes a photo of shelf items or an Invoice -> AI automatically detects product or item names, prices, and product quantities.
3. **AI Invoice & Receipt:** Automatic extraction of invoice photos including product or item names, prices, quantities, taxes, discounts, and totals from supplier invoices.
4. **WhatsApp Sales Integration:** Extraction of sales data directly from WhatsApp chat/invoice screenshots.
5. **Human-in-the-Loop Validation:** Every AI extraction result will be displayed in an interactive dashboard to be reviewed and validated by the user before being committed to the database.

---

## 💻 Tech Stack

- **Framework:** Next.js 16 (TypeScript)
- **Database:** Supabase
- **AI:** Google Generative AI (GEMINI 2.5)

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/hanif411/adminaiassistant.git](https://github.com/hanif411/adminaiassistant.git)
   cd adminaiassistant
   ```
2. **Install dependencies:**

   ````bash
   npm install
     ```

   ````

3. **Configure Environment Variables**
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
4. **Run the development server**

   ```bash
   npm run dev
   ```

```

```

## 🌟 Executive Summary

Aplikasi ini dirancang untuk memangkas waktu kerja administrasi retail yang repetitif. Dengan integrasi AI, sistem dapat "membaca" foto rak gudang (stock opname), struk belanja (invoice), hingga screenshot penjualan WhatsApp, lalu mengubahnya menjadi data digital secara otomatis.

- **Impact:** Mengurangi waktu input data hingga 80%.
- **Reliability:** Sistem verifikasi user interaktif untuk validasi sebelum masuk ke database.

---

## 🛠️ Technical Deep Dive

Sistem ini menggunakan arsitektur modern untuk menangani beban komputasi AI dan sinkronisasi data:

- **Frontend:** Next.js 16 (TypeScript)
- **AI Engine:** Google Gemini 2.5 Vision untuk OCR (Optical Character Recognition) dan Entity Extraction berbasis konteks.
- **Database & Auth:** Supabase dan Goggle OAuth
- **Logic:** Implementasi _Contextual Text Recovery_—AI Gemini mampu memprediksi teks yang buram/terpotong (contoh: "ind mi" menjadi "Indomie") berdasarkan data yang sudah saya coba.

---

## 🚀 Key Features & User Workflow

1. **Secure Authentication:** Login cepat dan aman menggunakan Google OAuth.
2. **AI Stock Opname:** User mengambil foto rak barang atau foto Invoice -> AI mendeteksi nama produk atau item, harga, jumlah produk secara otomatis.
3. **AI Invoice & Receipt:** Ekstraksi otomatis foto invoice data nama product atau item, harga,jumlah product, pajak, diskon dan total dari invoice supplier.
4. **WhatsApp Sales Integration:** Ekstraksi data penjualan langsung dari screenshot chat/invoice WhatsApp.
5. **Human-in-the-Loop Validation:** Setiap hasil ekstraksi AI akan ditampilkan dalam dashboard interaktif untuk di-review dan divalidasi oleh user sebelum di-commit ke database.

---

## 💻 Tech Stack

- **Framework:** Next.js 16 (TypeScript)
- **Database:** Supabase
- **AI:** Google Generative AI (GEMINI 2.5)