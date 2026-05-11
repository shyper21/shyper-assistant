# Shyper — Personal AI Assistant

Voice assistant pribadi berbasis web. Ucapkan **"Hey Shyper"** untuk mengaktifkan.

## Stack
- Next.js 14 (hosted di Vercel)
- Nanobot API (hosted di Railway)
- Web Speech API (STT + TTS bawaan browser)

## Setup Vercel

Tambahkan environment variable di Vercel dashboard:
```
NANOBOT_API_KEY = api_key_kamu
```

## Cara Pakai
1. Buka website di Chrome (Android)
2. Izinkan akses mikrofon
3. Ucapkan **"Hey Shyper"**
4. Setelah Shyper menjawab "Ya?", ucapkan perintahmu
5. Shyper akan menjawab dengan suara

## Catatan
- Gunakan Chrome di Android untuk hasil terbaik
- Web Speech API membutuhkan koneksi internet
