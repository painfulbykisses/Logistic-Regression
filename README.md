# Tugas 2 — Simulasi Regresi Linier dengan Gradient Descent

**Mata Kuliah:** Pemodelan Inteligensi Buatan  
**Nama:** Muhammad Dzikri Hikmatika Chairul Hadi  
**NIM:** 225090307111007

---

## Deskripsi

Simulasi interaktif untuk menemukan **garis regresi linier terbaik** (`ŷ = m·x + b`) menggunakan **pendekatan numerik Gradient Descent**. 

Program ini memungkinkan pengguna menjalankan **beberapa simulasi sekaligus** dengan parameter yang berbeda (learning rate, slope awal, intercept awal), lalu membandingkan hasilnya berdasarkan **Mean Squared Error (MSE)** untuk menentukan garis terbaik.

Terinspirasi dari video [Linear Regression: A Friendly Introduction](https://www.youtube.com/watch?v=wYPUhge9w5c) oleh Luis Serrano.

---

## Cara Kerja Algoritma

### 1. Model Linier
Garis regresi dimodelkan sebagai:
```
ŷ = m·x + b
```
- `m` = slope (kemiringan garis)
- `b` = intercept (titik potong sumbu y)

### 2. Mean Squared Error (MSE)
Fungsi cost yang mengukur seberapa jauh garis prediksi dari data aktual:
```
MSE = (1/n) Σ(yᵢ - ŷᵢ)²
```
Semakin kecil MSE, semakin baik garis regresi mewakili data.

### 3. Gradient Descent
Algoritma optimisasi numerik yang secara iteratif memperbarui nilai `m` dan `b` untuk meminimalkan MSE:
```
∂MSE/∂m = (-2/n) Σ xᵢ·(yᵢ - ŷᵢ)
∂MSE/∂b = (-2/n) Σ (yᵢ - ŷᵢ)

m = m - α · ∂MSE/∂m
b = b - α · ∂MSE/∂b
```
- `α` (alpha) = learning rate, mengontrol ukuran langkah setiap iterasi

### 4. Learning Rate
- **Terlalu besar** → parameter akan melompat-lompat dan bisa divergen (tidak konvergen)
- **Terlalu kecil** → konvergensi sangat lambat, butuh banyak epoch
- **Tepat** → konvergensi cepat dan stabil menuju MSE minimum

---

## Fitur Aplikasi

### Step 1 — Input Data Points
- Klik langsung pada canvas untuk menambah titik data secara manual
- 3 opsi dataset preset: Dataset 1, Dataset 2, dan Random
- Tombol Clear untuk menghapus semua titik

### Step 2 — Konfigurasi Simulasi
- Masing-masing simulasi bisa diatur:
  - **Learning Rate (α)** — kecepatan belajar algoritma
  - **Slope Awal (m₀)** — nilai awal kemiringan garis (random)
  - **Intercept Awal (b₀)** — nilai awal titik potong (random)
- Maksimal 6 simulasi berjalan bersamaan
- Tombol Randomize untuk mengacak ulang nilai awal

### Step 3 — Visualisasi Animasi
- Setiap simulasi memiliki canvas sendiri yang menampilkan:
  - **Garis regresi** bergerak menuju posisi optimal
  - **Ghost lines** — jejak pergerakan garis sebelumnya
  - **Error lines** — garis putus-putus menunjukkan jarak (residual) tiap titik ke garis
- **Statistik real-time**: epoch, m, b, MSE untuk setiap simulasi
- **Grafik MSE Convergence** — menampilkan kurva penurunan MSE semua simulasi dalam satu chart
- Kontrol: kecepatan animasi, pause/play, dan reset

### Hasil — Perbandingan
- Tabel ranking semua simulasi di-sort berdasarkan **MSE terendah**
- Menampilkan: rank, learning rate, initial m/b, final m/b, final MSE, jumlah epoch
- Card khusus untuk **garis regresi terbaik** beserta persamaannya

---

## Struktur File

```
├── index.html    # Halaman utama (struktur HTML)
├── style.css     # Styling (tema hitam-oranye minimalis)
├── app.js        # Logika gradient descent, rendering canvas, animasi
└── README.md     # Dokumentasi ini
```

### Penjelasan Tiap File

#### `index.html`
Struktur halaman web yang terdiri dari:
- **Hero header** — judul tugas, nama mahasiswa, NIM
- **Section Data Points** — canvas interaktif dan tombol preset
- **Section Konfigurasi** — card simulasi dan tombol jalankan
- **Section Visualisasi** — grid canvas animasi dan chart MSE
- **Section Hasil** — tabel perbandingan dan card garis terbaik
- **Section Info** — penjelasan teori (model linier, MSE, gradient descent, learning rate)

#### `style.css`
Desain visual dengan tema minimalis hitam-oranye:
- CSS custom properties (variables) untuk konsistensi warna
- Layout responsif dengan CSS Grid dan Flexbox
- Animasi halus (fade-in, hover effects)
- HiDPI/Retina canvas support

#### `app.js`
Seluruh logika aplikasi:
- **`computeMSE()`** — menghitung Mean Squared Error
- **`computeGradients()`** — menghitung turunan parsial ∂MSE/∂m dan ∂MSE/∂b
- **`runAllGradientDescent()`** — menjalankan gradient descent untuk semua simulasi
- **`drawVizFrame()`** — rendering canvas per frame (garis, titik, error lines)
- **`drawMSEChart()`** — rendering grafik konvergensi MSE
- **`animateSimulations()`** — loop animasi dengan kontrol kecepatan
- **`showResults()`** — menampilkan tabel perbandingan di-sort berdasarkan MSE

---

## Cara Menjalankan

1. Download atau clone repository ini
2. Buka file `index.html` di browser (double-click)
3. Pilih dataset atau klik canvas untuk menambah titik data
4. Atur parameter simulasi (learning rate, slope awal, intercept awal)
5. Klik **"Jalankan Semua Simulasi"**
6. Amati animasi pencarian garis terbaik
7. Lihat tabel hasil perbandingan di bagian bawah

---

## Teknologi

- **HTML5 Canvas** — rendering grafik dan animasi
- **Vanilla JavaScript** — algoritma gradient descent dan logika aplikasi
- **Vanilla CSS** — styling dengan custom properties
- **Google Fonts** — Inter (teks) dan JetBrains Mono (kode/angka)

Tidak menggunakan library atau framework eksternal.

---

## Referensi

- [Linear Regression: A Friendly Introduction — Luis Serrano (YouTube)](https://www.youtube.com/watch?v=wYPUhge9w5c)
- [Gradient Descent — Wikipedia](https://en.wikipedia.org/wiki/Gradient_descent)
- [Mean Squared Error — Wikipedia](https://en.wikipedia.org/wiki/Mean_squared_error)
