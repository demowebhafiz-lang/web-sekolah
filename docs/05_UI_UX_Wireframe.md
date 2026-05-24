# UI/UX Wireframe

## 1. Prinsip Desain

1. Bahasa Indonesia.
2. Tampilan sederhana.
3. Input nilai cepat seperti spreadsheet.
4. Input hafalan jelas dan mudah dibaca.
5. Menu berdasarkan role.
6. Responsif untuk desktop dan tablet.

## 2. Layout Utama

```txt
+------------------------------------------------------+
| Header: Nama Aplikasi, Tahun Ajaran, User, Logout    |
+----------------------+-------------------------------+
| Sidebar              | Main Content                  |
| - Dashboard          |                               |
| - Data Master        |                               |
| - Nilai              |                               |
| - Hafalan            |                               |
| - Laporan            |                               |
| - Pengaturan         |                               |
+----------------------+-------------------------------+
```

## 3. Login Page

```txt
+--------------------------------------+
|              Logo App                |
|        Sistem Nilai & Hafalan        |
|                                      |
| Email                                |
| [____________________________]       |
| Password                             |
| [____________________________]       |
|                                      |
| [ Masuk ]                            |
|                                      |
| Lupa password? Hubungi admin         |
+--------------------------------------+
```

## 4. Dashboard

```txt
+------------------------------------------------------+
| Dashboard                                            |
+------------------+------------------+----------------+
| Total Siswa      | Total Kelas      | Rata-rata Nilai|
| 250              | 12               | 84.5           |
+------------------+------------------+----------------+
| Hafalan Lancar   | Perlu Perbaikan  | Setoran Bulan Ini |
| 120              | 25               | 450            |
+------------------+------------------+----------------+

+-----------------------------+------------------------+
| Grafik Rata-rata Nilai      | Grafik Hafalan         |
+-----------------------------+------------------------+

+------------------------------------------------------+
| Siswa Perlu Perhatian                               |
| No | Nama | Kelas | Masalah | Aksi                  |
+------------------------------------------------------+
```

## 5. Data Siswa

```txt
+------------------------------------------------------+
| Data Siswa                                      [+ Tambah] |
+------------------------------------------------------+
| Filter: [Kelas] [Status] [Jenis Kelamin] [Cari...]   |
+------------------------------------------------------+
| No | NIS | Nama | JK | Kelas | Status | Aksi          |
| 1  | ... | ...  | L  | 1A    | Aktif  | Detail Edit   |
+------------------------------------------------------+
```

## 6. Form Siswa

```txt
+------------------------------------------------------+
| Tambah/Edit Siswa                                    |
+------------------------------------------------------+
| NIS                    [________________]            |
| NISN                   [________________]            |
| Nama Lengkap           [________________]            |
| Jenis Kelamin          [L/P___________]              |
| Tempat Lahir           [________________]            |
| Tanggal Lahir          [____-__-__]                  |
| Kelas                  [Pilih Kelas____]             |
| Nama Orang Tua         [________________]            |
| No HP Orang Tua        [________________]            |
| Alamat                 [________________]            |
| Status                 [Aktif_________]              |
|                                                      |
| [Batal] [Simpan]                                      |
+------------------------------------------------------+
```

## 7. Input Nilai

```txt
+------------------------------------------------------+
| Input Nilai                                          |
+------------------------------------------------------+
| Kelas        [1A v]                                  |
| Mapel        [Matematika v]                          |
| Semester     [Ganjil v]                              |
| Tahun Ajaran [2026/2027 v]                           |
| Jenis Nilai  [Harian v]                              |
|                                                      |
| [Tampilkan Siswa]                                    |
+------------------------------------------------------+

+------------------------------------------------------+
| No | NIS | Nama Siswa | Nilai | Catatan              |
| 1  | ... | Ahmad      | [85]  | [Baik]               |
| 2  | ... | Fatimah    | [90]  | [Sangat baik]        |
+------------------------------------------------------+
| [Simpan Semua Nilai]                                 |
+------------------------------------------------------+
```

## 8. Rekap Nilai

```txt
+------------------------------------------------------+
| Rekap Nilai                                          |
+------------------------------------------------------+
| Filter: [Kelas] [Siswa] [Mapel] [Semester] [Tahun]   |
| [Tampilkan] [Cetak]                                  |
+------------------------------------------------------+
| No | Nama | Mapel | Harian | Tugas | PTS | PAS | Rata |
+------------------------------------------------------+
```

## 9. Input Hafalan

```txt
+------------------------------------------------------+
| Input Hafalan Al-Qur'an                              |
+------------------------------------------------------+
| Kelas             [1A v]                             |
| Siswa             [Ahmad Fauzi v]                    |
| Juz               [30]                               |
| Surah             [An-Naba]                          |
| Nomor Surah       [78]                               |
| Ayat Awal         [1]                                |
| Ayat Akhir        [10]                               |
| Tanggal Setor     [2026-05-23]                       |
| Status            [Lancar v]                         |
|                                                      |
| Nilai Kelancaran  [90]                               |
| Nilai Tajwid      [85]                               |
| Nilai Makhraj     [88]                               |
| Nilai Adab        [95]                               |
| Rata-rata         89.5                               |
| Catatan           [textarea]                         |
|                                                      |
| [Simpan Hafalan]                                    |
+------------------------------------------------------+
```

## 10. Riwayat Hafalan

```txt
+------------------------------------------------------+
| Riwayat Hafalan Siswa                                |
+------------------------------------------------------+
| Siswa: Ahmad Fauzi                                   |
| Kelas: 1A                                            |
+------------------------------------------------------+
| Tanggal | Juz | Surah | Ayat | Status | Rata | Catatan|
+------------------------------------------------------+
```

## 11. Rekap Hafalan

```txt
+------------------------------------------------------+
| Rekap Hafalan                                        |
+------------------------------------------------------+
| Filter: [Kelas] [Siswa] [Juz] [Status] [Tanggal]     |
| [Tampilkan] [Cetak]                                  |
+------------------------------------------------------+
| No | Nama | Total Setoran | Terakhir | Status Dominan |
+------------------------------------------------------+
```

## 12. Laporan Cetak Siswa

```txt
+------------------------------------------------------+
| LAPORAN PERKEMBANGAN SISWA                           |
| Nama: Ahmad Fauzi                                    |
| Kelas: 1A                                            |
| Tahun Ajaran: 2026/2027                              |
+------------------------------------------------------+
| A. Nilai Akademik                                    |
| Mapel | Harian | Tugas | PTS | PAS | Rata            |
+------------------------------------------------------+
| B. Hafalan Al-Qur'an                                 |
| Juz | Surah | Ayat | Status | Rata | Catatan          |
+------------------------------------------------------+
| Catatan Wali Kelas                                   |
| [................................................]   |
+------------------------------------------------------+
| [Cetak]                                              |
+------------------------------------------------------+
```

## 13. Empty State

```txt
Belum ada data.
Silakan tambahkan data terlebih dahulu.
[Tambah Data]
```

## 14. Loading State

```txt
Memuat data...
```

## 15. Error State

```txt
Gagal memuat data.
Pesan: koneksi backend gagal.
[Coba Lagi]
```
