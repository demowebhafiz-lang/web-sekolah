# Frontend UI/UX Plan

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan tampilan frontend aplikasi pencatatan nilai siswa/siswi dan hafalan Al-Qur’an.

Frontend harus terlihat modern, rapi, profesional, mudah digunakan guru/admin, cocok untuk sekolah Islam, madrasah, TPQ, dan rumah tahfidz, serta responsif untuk desktop, tablet, dan mobile.

Dokumen ini bisa dipakai oleh developer atau AI coding agent seperti Codex, Cursor, Windsurf, Copilot, atau Claude Code agar hasil UI tidak polos.

## 2. Tech Stack UI

Gunakan:

```txt
React + Vite
Tailwind CSS
React Router DOM
Lucide React Icons
Recharts
Komponen bergaya shadcn/ui
Toast notification
Responsive layout
Print-friendly CSS
```

Opsional:

```txt
React Hook Form
Zod/Yup validation
TanStack Table
html2pdf.js
```

## 3. Konsep Visual

Konsep desain:

```txt
Modern Islamic School Dashboard
```

Karakter desain:

1. Bersih.
2. Warna lembut.
3. Fokus pada keterbacaan data.
4. Tidak terlalu ramai.
5. Form mudah diisi.
6. Tabel nyaman digunakan.
7. Nuansa hijau/tahfidz tetapi tetap profesional.

## 4. Tema Warna

| Token | Warna | Kegunaan |
|---|---|---|
| Primary | Emerald / Green | Tombol utama, sidebar aktif |
| Secondary | Slate / Gray | Teks, border, background netral |
| Accent | Amber / Gold | Achievement, highlight, progress |
| Background | Soft gray / white | Background halaman |
| Danger | Red | Error, delete |
| Warning | Amber | Perlu perhatian |
| Success | Emerald | Sukses, lancar |
| Info | Sky / Blue | Informasi |

Contoh Tailwind class:

```txt
bg-emerald-600
text-emerald-700
bg-emerald-50
bg-amber-100
text-amber-700
bg-slate-50
text-slate-700
border-slate-200
```

## 5. Typography

Gunakan font sans-serif modern:

```txt
Inter
system-ui
Arial
sans-serif
```

| Elemen | Ukuran |
|---|---|
| Page title | text-2xl / text-3xl |
| Section title | text-xl |
| Card title | text-base / text-lg |
| Body | text-sm / text-base |
| Table text | text-sm |
| Helper text | text-xs |

## 6. Layout Utama

Gunakan layout dashboard:

```txt
+------------------------------------------------------+
| Topbar: Nama aplikasi, tahun ajaran, user, logout    |
+----------------------+-------------------------------+
| Sidebar              | Main Content                  |
| Dashboard            | Page Header                   |
| Data Master          | Cards / Tables / Forms        |
| Nilai                |                               |
| Hafalan              |                               |
| Laporan              |                               |
| Pengaturan           |                               |
+----------------------+-------------------------------+
```

Desktop:

- Sidebar fixed di kiri.
- Topbar sticky.
- Konten scrollable.

Mobile:

- Sidebar menjadi drawer.
- Topbar punya hamburger menu.
- Tabel bisa horizontal scroll.

## 7. Struktur Navigasi

```txt
Dashboard

Data Master
  - Siswa
  - Kelas
  - Guru
  - Mata Pelajaran

Nilai
  - Input Nilai
  - Rekap Nilai

Hafalan Al-Qur’an
  - Input Hafalan
  - Riwayat Hafalan
  - Rekap Hafalan

Laporan
  - Laporan Siswa
  - Cetak Laporan

Pengaturan
Logout
```

## 8. Komponen Reusable

Buat komponen reusable berikut:

```txt
Layout
Sidebar
Topbar
PageHeader
StatCard
DataTable
FilterBar
SearchInput
FormCard
FormSection
StatusBadge
RoleBadge
PredikatBadge
ProgressBar
EmptyState
LoadingState
ErrorState
ConfirmDialog
ToastNotification
PrintLayout
```

## 9. Detail Komponen

### 9.1 PageHeader

Fungsi:

- Menampilkan judul halaman.
- Menampilkan deskripsi pendek.
- Menampilkan tombol aksi utama.

Contoh:

```txt
Data Siswa
Kelola data siswa/siswi aktif, lulus, pindah, dan nonaktif.
[+ Tambah Siswa]
```

### 9.2 StatCard

Digunakan di dashboard.

Isi:

- Icon
- Label
- Angka
- Keterangan kecil
- Trend opsional

Contoh:

```txt
Total Siswa Aktif
250
+12 siswa baru bulan ini
```

### 9.3 DataTable

Fitur:

- Header rapi
- Zebra hover
- Search
- Filter
- Pagination
- Empty state
- Loading state
- Aksi per row
- Horizontal scroll di mobile

### 9.4 FilterBar

Dipakai pada halaman data siswa, rekap nilai, rekap hafalan, dan laporan.

Isi umum:

```txt
[Kelas] [Status] [Semester] [Tahun Ajaran] [Cari...] [Tampilkan]
```

### 9.5 FormCard

Form diletakkan dalam card agar rapi.

Gunakan section:

```txt
Data Utama
Data Orang Tua
Status
```

### 9.6 StatusBadge

| Status | Warna |
|---|---|
| aktif | emerald |
| nonaktif | slate |
| lulus | blue |
| pindah | amber |
| lancar | emerald |
| perlu_perbaikan | red |
| murajaah | amber |
| selesai | blue |

### 9.7 PredikatBadge

| Predikat | Range | Warna |
|---|---|---|
| A | 90-100 | emerald |
| B | 80-89 | blue |
| C | 70-79 | amber |
| D | 0-69 | red |

## 10. Login Page

Wireframe:

```txt
+--------------------------------------------------+
|                  Logo / Icon                     |
|        Sistem Nilai & Hafalan Al-Qur’an          |
|                                                  |
| Email                                            |
| [________________________________]               |
| Password                                         |
| [________________________________]               |
|                                                  |
| [ Masuk ]                                        |
|                                                  |
| Hubungi admin jika lupa password                 |
+--------------------------------------------------+
```

Desain:

- Background gradient lembut emerald.
- Card putih dengan shadow.
- Icon buku/Qur’an/sekolah.
- Input rounded.
- Button emerald.

## 11. Dashboard Page

Komponen:

```txt
Stat cards
Chart nilai
Chart hafalan
Daftar siswa perlu perhatian
Aktivitas terbaru
```

Stat cards:

1. Total siswa aktif.
2. Total kelas.
3. Rata-rata nilai.
4. Total setoran hafalan.
5. Hafalan lancar.
6. Perlu murajaah/perbaikan.

Chart:

1. Rata-rata nilai per kelas.
2. Status hafalan.
3. Setoran hafalan per bulan.

Wireframe:

```txt
+------------------------------------------------------+
| Dashboard                                            |
| Ringkasan perkembangan akademik dan hafalan          |
+------------------+------------------+----------------+
| Total Siswa      | Total Kelas      | Rata-rata Nilai|
+------------------+------------------+----------------+
| Setoran Hafalan  | Hafalan Lancar   | Perlu Murajaah |
+------------------+------------------+----------------+

+-----------------------------+------------------------+
| Grafik Nilai per Kelas      | Status Hafalan         |
+-----------------------------+------------------------+

+------------------------------------------------------+
| Siswa Perlu Perhatian                                |
+------------------------------------------------------+
```

## 12. Data Siswa Page

Fitur:

- Tambah siswa.
- Edit siswa.
- Nonaktifkan siswa.
- Filter kelas/status/jenis kelamin.
- Search nama/NIS.

Wireframe:

```txt
Data Siswa                                    [+ Tambah Siswa]
Kelola data siswa/siswi.

[Filter Kelas] [Status] [Jenis Kelamin] [Cari nama/NIS...]

| No | NIS | Nama | JK | Kelas | Orang Tua | Status | Aksi |
```

UX:

- Status ditampilkan sebagai badge.
- Tombol aksi menggunakan dropdown atau icon.
- Empty state saat data kosong.

## 13. Input Nilai Page

Halaman input nilai harus cepat digunakan seperti spreadsheet ringan.

Wireframe:

```txt
Input Nilai
Catat nilai siswa berdasarkan kelas, mapel, dan jenis penilaian.

[Kelas] [Mapel] [Semester] [Tahun Ajaran] [Jenis Nilai]
[Tampilkan Siswa]

| No | NIS | Nama Siswa | Nilai | Predikat | Catatan |
| 1  | ... | Ahmad      | [85]  | B        | [Baik]  |
| 2  | ... | Fatimah    | [90]  | A        | [...]   |

                         [Simpan Semua Nilai]
```

UX wajib:

1. Nilai hanya 0 sampai 100.
2. Predikat otomatis berubah saat nilai diketik.
3. Badge predikat berwarna.
4. Tombol Simpan Semua sticky di bawah.
5. Loading saat menyimpan.
6. Toast sukses/error.
7. Warning jika ada nilai tidak valid.

## 14. Rekap Nilai Page

Fitur:

- Filter kelas.
- Filter siswa.
- Filter mapel.
- Filter semester.
- Filter tahun ajaran.
- Cetak.

Wireframe:

```txt
Rekap Nilai

[Kelas] [Siswa] [Mapel] [Semester] [Tahun Ajaran] [Tampilkan] [Cetak]

| No | Nama | Mapel | Harian | Tugas | PTS | PAS | Rata-rata | Predikat |
```

Tambahkan summary card:

```txt
Rata-rata kelas
Nilai tertinggi
Nilai terendah
Jumlah siswa
```

## 15. Input Hafalan Page

Layout desktop:

```txt
+--------------------------------------+---------------------------+
| Form Input Hafalan                   | Riwayat Terakhir          |
|                                      | Progress Hafalan          |
+--------------------------------------+---------------------------+
```

Section form:

```txt
Data Siswa
- Kelas
- Siswa

Setoran Hafalan
- Juz
- Surah
- Nomor Surah
- Ayat Awal
- Ayat Akhir
- Tanggal Setor
- Status Hafalan

Penilaian Bacaan
- Kelancaran
- Tajwid
- Makhraj
- Adab
- Rata-rata otomatis

Catatan Guru
- Textarea
```

UX:

1. Rata-rata otomatis dihitung.
2. Status hafalan tampil sebagai badge.
3. Validasi juz 1-30.
4. Validasi nomor surah 1-114.
5. Validasi ayat awal <= ayat akhir.
6. Validasi nilai aspek 1-100.
7. Panel kanan menampilkan riwayat terbaru siswa.

## 16. Riwayat Hafalan Page

Wireframe:

```txt
Riwayat Hafalan

[Kelas] [Siswa] [Tampilkan]

Profil Siswa:
Nama, Kelas, Total Setoran, Rata-rata Hafalan

| Tanggal | Juz | Surah | Ayat | Status | Rata-rata | Catatan |
```

Tambahkan timeline opsional:

```txt
23 Mei 2026 - Juz 30 An-Naba 1-10 - Lancar
20 Mei 2026 - Juz 30 An-Nazi'at 1-8 - Murajaah
```

## 17. Rekap Hafalan Page

Fitur:

- Filter kelas.
- Filter siswa.
- Filter juz.
- Filter status.
- Filter tanggal.
- Cetak.

Summary card:

```txt
Total setoran
Rata-rata hafalan
Hafalan lancar
Perlu murajaah
```

Tabel:

```txt
| No | Nama | Kelas | Total Setoran | Juz Terakhir | Status Terakhir | Rata-rata |
```

## 18. Laporan Siswa Page

Halaman laporan harus print-friendly.

Wireframe:

```txt
LAPORAN PERKEMBANGAN SISWA

Nama Sekolah
Alamat Sekolah

Nama Siswa:
Kelas:
Semester:
Tahun Ajaran:

A. Nilai Akademik
| Mapel | Harian | Tugas | PTS | PAS | Rata-rata | Predikat |

B. Hafalan Al-Qur’an
| Tanggal | Juz | Surah | Ayat | Status | Rata-rata | Catatan |

C. Catatan Wali Kelas

Tanda tangan:
Wali Kelas
Kepala Sekolah
```

CSS print:

- Sidebar tidak tampil.
- Topbar tidak tampil.
- Tombol tidak tampil.
- Background putih.
- Ukuran A4.
- Margin rapi.

Contoh:

```css
@media print {
  .no-print {
    display: none !important;
  }

  .print-page {
    width: 210mm;
    min-height: 297mm;
    background: white;
    padding: 16mm;
  }
}
```

## 19. Empty State

Contoh:

```txt
Belum ada data siswa.
Silakan tambahkan data siswa terlebih dahulu.

[Tambah Siswa]
```

## 20. Loading State

Gunakan skeleton atau spinner.

```txt
Memuat data...
```

Jangan biarkan halaman kosong saat request berjalan.

## 21. Error State

```txt
Gagal memuat data.
Periksa koneksi atau coba lagi.

[Coba Lagi]
```

## 22. Toast Notification

Gunakan toast untuk:

- Login berhasil.
- Data berhasil disimpan.
- Nilai berhasil disimpan.
- Hafalan berhasil disimpan.
- Error validasi.
- Error koneksi backend.

Contoh pesan:

```txt
Berhasil menyimpan nilai 25 siswa.
Hafalan Ahmad Fauzi berhasil dicatat.
Nilai harus antara 0 sampai 100.
```

## 23. Responsive Design

| Ukuran | Perilaku |
|---|---|
| Desktop | Sidebar tetap, konten grid |
| Tablet | Sidebar bisa collapse |
| Mobile | Sidebar drawer, tabel scroll horizontal |

Mobile rules:

1. Form menjadi 1 kolom.
2. Card full width.
3. Tabel dapat scroll horizontal.
4. Tombol aksi full width bila perlu.
5. Header tidak terlalu tinggi.

## 24. Accessibility

Minimal:

1. Label input jelas.
2. Kontras warna cukup.
3. Button punya teks jelas.
4. Error field tampil dekat input.
5. Bisa navigasi dengan keyboard.
6. Jangan hanya mengandalkan warna untuk status.

## 25. Microcopy

| Situasi | Teks |
|---|---|
| Simpan berhasil | Data berhasil disimpan |
| Error validasi | Periksa kembali data yang wajib diisi |
| Data kosong | Belum ada data |
| Loading | Memuat data... |
| Unauthorized | Anda tidak memiliki akses |
| Session expired | Sesi Anda telah berakhir, silakan login kembali |

## 26. Prompt untuk AI Coding

```txt
Baca seluruh file docs.

Saya ingin frontend aplikasi dibuat dengan tampilan modern, rapi, dan profesional untuk sekolah Islam / madrasah / rumah tahfidz.

Gunakan:
- React + Vite
- Tailwind CSS
- komponen bergaya shadcn/ui
- lucide-react untuk ikon
- recharts untuk grafik
- responsive layout desktop dan mobile

Jangan buat tampilan polos.

Buat UI dengan:
- sidebar modern
- topbar
- dashboard cards
- data table rapi
- filter bar
- form card
- badge status
- progress hafalan
- loading state
- empty state
- error state
- toast notification
- print-friendly report

Gunakan tema warna:
- primary emerald
- accent amber/gold
- background slate/gray lembut
- text slate

Tugas pertama:
1. Buat design system sederhana.
2. Buat layout utama.
3. Buat Sidebar dan Topbar.
4. Buat DashboardPage dengan cards dan chart dummy.
5. Buat komponen reusable:
   - StatCard
   - DataTable
   - FilterBar
   - StatusBadge
   - FormCard
   - PageHeader
   - EmptyState
   - LoadingState
   - ConfirmDialog
```

## 27. Prompt Halaman Input Nilai

```txt
Lanjutkan buat halaman Input Nilai dengan UI yang bagus.

Kebutuhan:
- filter kelas, mapel, semester, tahun ajaran, jenis nilai
- tabel input nilai seperti spreadsheet
- validasi nilai 0-100
- predikat otomatis A/B/C/D
- badge predikat
- tombol Simpan Semua sticky di bawah
- loading state
- empty state
- toast sukses/error
- responsive untuk layar kecil
```

## 28. Prompt Halaman Hafalan

```txt
Lanjutkan buat halaman Input Hafalan Al-Qur'an dengan UI modern.

Kebutuhan:
- form dalam card
- bagian Data Siswa
- bagian Setoran Hafalan
- bagian Penilaian Bacaan
- auto hitung rata-rata
- status badge: baru, lancar, perlu perbaikan, murajaah, selesai
- panel riwayat hafalan terakhir
- progress hafalan siswa
- toast sukses/error
```

## 29. Prompt Halaman Laporan

```txt
Buat halaman Laporan Siswa yang print-friendly.

Kebutuhan:
- header logo dan nama sekolah
- informasi siswa
- tabel nilai akademik
- tabel hafalan Al-Qur'an
- catatan wali kelas
- tombol Cetak
- CSS print mode
- saat print, sidebar/topbar/tombol tidak tampil
```

## 30. Acceptance Criteria UI

Frontend dianggap bagus jika:

- [ ] Login page tidak polos.
- [ ] Sidebar dan topbar rapi.
- [ ] Dashboard punya stat cards dan chart.
- [ ] Tabel data mudah dibaca.
- [ ] Form input nyaman digunakan.
- [ ] Input nilai mirip spreadsheet.
- [ ] Input hafalan punya section jelas.
- [ ] Status dan predikat memakai badge.
- [ ] Ada loading, empty, dan error state.
- [ ] Ada toast notification.
- [ ] Halaman laporan bisa dicetak rapi.
- [ ] Tampilan responsive.
- [ ] Warna konsisten.
- [ ] Tidak ada secret/token hardcoded.
