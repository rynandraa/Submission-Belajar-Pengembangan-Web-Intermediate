# StoryApp - Single Page Application (SPA)

**Author:** Ryan Andrayadi Kusyanto  
**Project:** Submission Pertama Belajar Pengembangan Web Intermediate (Dicoding)

---

## 📌 Deskripsi Proyek
Proyek ini merupakan sebuah Single Page Application (SPA) berbasis Vanilla JavaScript dan HTML/CSS modern (tanpa framework eksternal React/Vue) yang dihubungkan dengan Dicoding Story API. Tujuan utama proyek ini adalah menerapkan transisi halaman yang mulus dan cepat, penggabungan interaktivitas peta digital geografis, serta memperhatikan aspek aksesibilitas agar dapat digunakan oleh semua pengguna secara intuitif.

Aplikasi ini menggunakan ekosistem **Webpack** sebagai *module bundler* agar siap digunakan pada server produksi.

---

## 💻 Panduan Menjalankan

Webpack sudah tertanam otomatis di setelan proyek, mencakup `css-loader` untuk membaca seluruh tata letak dan `babel-loader` sebagai penertib bahasa antar peramban.

1. **Unduh Paket NPM Internal:**
   Posisikan Terminal/CMD di folder utama sumber kode, lalu jalankan perintah berikut untuk mengunduh semua dependencies yang diperlukan:
   ```shell
   npm install
   ```

2. **Jalankan Aplikasi Mode Development:**
   Anda dapat menghidupkan *Webpack Dev-Server Lokal* sembari memantaunya dengan mengetikkan perintah:
   ```shell
   npm run start-dev
   ```
3. Buka URL yang tertera di terminal, normalnya mengarah ke `http://localhost:9000/`.

4. **Kompilasi Rilis Produksi (Build):**
   Gunakan perintah di bawah jika Anda ingin membuat hasil bundle yang tersimpan di dalam folder `dist/` untuk persiapan hosting.
   ```shell
   npm run build
   ```
