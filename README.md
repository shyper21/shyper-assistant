# 🤖 Shyper Assistant

**Shyper** adalah asisten AI pribadi berbasis web dengan antarmuka suara, terinspirasi dari karakter Shadow / Cid Kagenou (*Eminence in Shadow*). Cukup ucapkan **"Hey Shyper"** untuk mengaktifkan, dan Shyper akan merespons seperti J.A.R.V.I.S. yang misterius dan percaya diri.

---

## ✨ Fitur Utama

- 🎙️ **Voice Activation** — Aktifkan dengan wake word *"Hey Shyper"* menggunakan Web Speech API
- 🔊 **Text-to-Speech** — Shyper menjawab dengan suara (TTS bawaan browser)
- 🧠 **Memori Percakapan** — Riwayat chat tersimpan di Supabase dan digunakan sebagai konteks
- 👤 **Profil Pengguna** — Shyper bisa "mengingat" fakta tentang kamu (disimpan di tabel `user_profile`)
- 📱 **Android App Launcher** — Bisa membuka YouTube, WhatsApp, Maps, Kamera, dan Pengaturan via perintah suara
- 🔐 **Autentikasi** — Login dengan email & password menggunakan Supabase Auth
- 📲 **PWA Ready** — Bisa diinstall di Android sebagai aplikasi (Progressive Web App)
- 🎨 **Avatar Animasi** — Avatar Cid Kagenou dengan animasi idle (bernapas, kedip, rambut, jubah)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| UI | React 18 + JSX CSS-in-JS |
| Auth & Database | Supabase (Auth + PostgreSQL) |
| AI Backend | OpenRouter API (default model: `deepseek/deepseek-chat`) |
| Speech | Web Speech API (STT & TTS — bawaan browser) |
| Hosting | Vercel |
| PWA | `manifest.json` + Service Worker (`sw.js`) |

---

## 📁 Struktur Proyek

```
shyper-assistant/
├── components/
│   └── JarvisAvatar.jsx        # Komponen avatar animasi (alternatif)
├── icons/
│   ├── icon-192.png            # Icon PWA 192x192
│   └── icon-512.png            # Icon PWA 512x512
├── lib/
│   └── supabaseClient.js       # Inisialisasi Supabase client (browser)
├── pages/
│   ├── _document.js            # Custom HTML document (font, meta)
│   ├── index.js                # Halaman utama — UI chat & voice
│   ├── login.js                # Halaman login
│   └── api/
│       ├── chat.js             # API route — kirim pesan ke OpenRouter
│       └── auth/
│           └── callback.js     # OAuth callback handler Supabase
├── manifest.json               # Konfigurasi PWA
├── middleware.js               # Proteksi route — redirect ke /login jika belum auth
├── next.config.js              # Konfigurasi Next.js
├── sw.js                       # Service Worker untuk PWA
└── package.json
```

---

## ⚙️ Setup & Instalasi

### 1. Clone repo

```bash
git clone https://github.com/username/shyper-assistant.git
cd shyper-assistant
npm install
```

### 2. Buat project di Supabase

1. Buka [supabase.com](https://supabase.com) dan buat project baru
2. Buat dua tabel berikut di **SQL Editor**:

```sql
-- Tabel riwayat percakapan
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,       -- 'user' atau 'assistant'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabel profil/fakta tentang pengguna
CREATE TABLE user_profile (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  facts text DEFAULT ''
);

-- Aktifkan Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own conversations"
  ON conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own profile"
  ON user_profile FOR ALL USING (auth.uid() = user_id);
```

3. Tambahkan akun pengguna di **Authentication > Users**

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat   # opsional, ini default-nya
```

> **Dapatkan API Key OpenRouter** di [openrouter.ai](https://openrouter.ai) — banyak model gratis tersedia.

### 4. Jalankan secara lokal

```bash
npm run dev
```

Buka di browser: `http://localhost:3000`

---

## 🚀 Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan **Environment Variables** di Vercel Dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   OPENROUTER_API_KEY
   OPENROUTER_MODEL   (opsional)
   ```
4. Deploy!

---

## 🗣️ Cara Menggunakan

1. Buka website di **Chrome Android** (direkomendasikan)
2. Login dengan email & password
3. Izinkan akses **mikrofon** saat diminta browser
4. Ucapkan **"Hey Shyper"**
5. Tunggu sampai Shyper menjawab *"Ya?"*
6. Ucapkan perintah atau pertanyaan kamu
7. Shyper akan menjawab secara verbal dan di layar

### Perintah Android (jika menggunakan AndroidLauncher WebView)

| Ucapkan | Aksi |
|---|---|
| *"Buka YouTube [kata pencarian]"* | Membuka YouTube dengan pencarian |
| *"Buka kamera"* | Membuka kamera |
| *"Buka WhatsApp"* | Membuka WhatsApp |
| *"Navigasi ke [lokasi]"* | Membuka Google Maps |
| *"Buka pengaturan"* | Membuka Settings Android |

> Fitur perintah Android memerlukan WebView wrapper khusus yang mengekspos `window.AndroidLauncher`.

---

## 🔒 Keamanan

- Semua route (kecuali `/login` dan `/api/auth/callback`) dilindungi oleh **middleware Supabase**
- API `/api/chat` memverifikasi sesi pengguna sebelum memanggil OpenRouter
- Row Level Security (RLS) aktif di Supabase agar data antar user tidak bisa saling diakses

---

## 🧩 Kustomisasi

### Ganti model AI

Ubah environment variable `OPENROUTER_MODEL` ke model lain dari [openrouter.ai/models](https://openrouter.ai/models), contoh:

```
OPENROUTER_MODEL=google/gemma-3-27b-it:free
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### Ganti kepribadian Shyper

Edit system prompt di `pages/api/chat.js` pada variabel `systemPrompt`. Saat ini Shyper berperan sebagai Jarvis yang misterius dan tenang seperti karakter Shadow.

### Ganti bahasa

Ubah konstanta `LANG` di `pages/index.js`:

```js
const LANG = 'id-ID'   // ganti ke 'en-US', 'ja-JP', dll.
```

---

## 📋 Catatan Penting

- Web Speech API **hanya berfungsi di Chrome** (terutama Chrome Android)
- Diperlukan **koneksi internet** untuk STT dan TTS
- Riwayat percakapan yang diambil sebagai konteks dibatasi **10 pesan terakhir**
- Perintah Android (`[OPEN_YOUTUBE:...]` dll.) **tidak disimpan** ke database
- Untuk instalasi sebagai PWA di Android: buka di Chrome → menu tiga titik → *"Add to Home Screen"*

---

## 📄 Lisensi

Proyek ini bersifat **private**. Lihat file `LICENSE` (jika ada) untuk detail lebih lanjut.
