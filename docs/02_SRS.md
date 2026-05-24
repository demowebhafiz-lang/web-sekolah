# SRS: Spesifikasi Kebutuhan Sistem

## 1. Tujuan

Dokumen ini menjelaskan kebutuhan fungsional dan non-fungsional sistem pencatatan nilai siswa/siswi dan hafalan Al-Qur’an.

## 2. Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| Super Admin | Akses penuh |
| Admin | Mengelola data master |
| Guru Mapel | Mengelola nilai akademik |
| Guru Tahfidz | Mengelola hafalan |
| Wali Kelas | Melihat rekap kelas |
| Kepala Sekolah | Melihat dashboard dan laporan |
| Orang Tua | Melihat laporan anak sendiri, opsional |

## 3. Hak Akses

| Fitur | Admin | Guru Mapel | Guru Tahfidz | Wali Kelas | Kepala Sekolah |
|---|---|---|---|---|---|
| Dashboard | Ya | Ya | Ya | Ya | Ya |
| CRUD Siswa | Ya | Tidak | Tidak | Lihat | Lihat |
| CRUD Kelas | Ya | Tidak | Tidak | Lihat | Lihat |
| CRUD Guru | Ya | Tidak | Tidak | Tidak | Lihat |
| CRUD Mapel | Ya | Tidak | Tidak | Tidak | Lihat |
| Input Nilai | Ya | Ya | Tidak | Tidak | Tidak |
| Edit Nilai | Ya | Ya, milik sendiri | Tidak | Tidak | Tidak |
| Input Hafalan | Ya | Tidak | Ya | Tidak | Tidak |
| Edit Hafalan | Ya | Tidak | Ya, milik sendiri | Tidak | Tidak |
| Rekap Nilai | Ya | Ya | Tidak | Ya | Ya |
| Rekap Hafalan | Ya | Tidak | Ya | Ya | Ya |
| Cetak Laporan | Ya | Terbatas | Terbatas | Ya | Ya |

## 4. Kebutuhan Fungsional

### 4.1 Login

Kode: FR-AUTH-001

Sistem harus menyediakan login dengan email dan password.

Acceptance criteria:

1. User aktif dapat login.
2. User nonaktif tidak dapat login.
3. Password salah menampilkan error.
4. Role user menentukan menu yang terlihat.
5. Token/session disimpan di browser.

### 4.2 Logout

Kode: FR-AUTH-002

Sistem harus menyediakan logout dan menghapus session lokal.

### 4.3 Manajemen Siswa

Kode: FR-SISWA-001

Admin dapat menambah, melihat, mengedit, dan menonaktifkan siswa.

Validasi:

1. Nama wajib diisi.
2. NIS wajib unik.
3. Kelas wajib dipilih.
4. Jenis kelamin hanya L atau P.
5. Status hanya aktif, lulus, pindah, atau nonaktif.

### 4.4 Manajemen Kelas

Kode: FR-KELAS-001

Admin dapat mengelola kelas.

Validasi:

1. Nama kelas wajib diisi.
2. Tahun ajaran wajib diisi.
3. Wali kelas opsional pada awal pembuatan.

### 4.5 Manajemen Guru

Kode: FR-GURU-001

Admin dapat mengelola data guru.

Validasi:

1. Nama guru wajib diisi.
2. Email wajib unik jika digunakan untuk login.
3. Role guru harus valid.

### 4.6 Manajemen Mata Pelajaran

Kode: FR-MAPEL-001

Admin dapat mengelola data mata pelajaran.

Validasi:

1. Nama mapel wajib diisi.
2. Kelompok mapel opsional.
3. Guru pengampu opsional.

### 4.7 Input Nilai Massal

Kode: FR-NILAI-001

Guru dapat menginput nilai beberapa siswa dalam satu halaman.

Validasi:

1. Kelas wajib dipilih.
2. Mata pelajaran wajib dipilih.
3. Semester wajib dipilih.
4. Tahun ajaran wajib dipilih.
5. Jenis nilai wajib dipilih.
6. Nilai harus 0 sampai 100.
7. Siswa harus aktif.
8. Sistem boleh update data lama jika kombinasi unik sudah ada.

Kombinasi unik nilai:

```txt
siswaId + mapelId + semester + tahunAjaran + jenisNilai
```

### 4.8 Rekap Nilai

Kode: FR-NILAI-002

Sistem harus dapat menampilkan rekap nilai berdasarkan filter.

Filter:

- Kelas
- Siswa
- Mapel
- Semester
- Tahun ajaran
- Jenis nilai

Output:

- Daftar nilai
- Rata-rata
- Nilai tertinggi
- Nilai terendah
- Predikat

### 4.9 Input Hafalan

Kode: FR-HAFALAN-001

Guru tahfidz dapat mencatat hafalan siswa.

Validasi:

1. Siswa wajib dipilih.
2. Kelas wajib terisi dari data siswa atau dipilih manual.
3. Juz harus 1 sampai 30.
4. Nomor surah harus 1 sampai 114.
5. Ayat awal harus lebih kecil atau sama dengan ayat akhir.
6. Nilai kelancaran, tajwid, makhraj, dan adab harus 1 sampai 100.
7. Status hafalan harus valid.

Status hafalan valid:

```txt
baru, lancar, perlu_perbaikan, murajaah, selesai
```

### 4.10 Rekap Hafalan

Kode: FR-HAFALAN-002

Sistem harus menampilkan riwayat dan rekap hafalan siswa.

Filter:

- Kelas
- Siswa
- Juz
- Surah
- Status
- Tanggal setor

Output:

- Total setoran
- Total rentang ayat
- Riwayat hafalan
- Hafalan perlu perbaikan
- Rata-rata nilai hafalan

### 4.11 Dashboard

Kode: FR-DASH-001

Sistem harus menampilkan ringkasan:

1. Total siswa aktif.
2. Total kelas aktif.
3. Rata-rata nilai.
4. Total hafalan lancar.
5. Total hafalan perlu perbaikan.
6. Siswa perlu perhatian.

### 4.12 Laporan Cetak

Kode: FR-LAP-001

Sistem harus menyediakan halaman laporan yang dapat dicetak browser.

## 5. Kebutuhan Non-Fungsional

### 5.1 Performance

1. Request daftar data menggunakan filter/pagination.
2. Batch save digunakan untuk input nilai massal.
3. Data master boleh dicache di frontend.

### 5.2 Security

1. Token frontend disimpan di environment variable Vercel.
2. Token backend disimpan di Apps Script Properties.
3. Apps Script memvalidasi header `x-app-token`.
4. Password tidak boleh plain text.
5. Role dicek di backend, bukan hanya di frontend.
6. Spreadsheet ID tidak boleh hardcoded di frontend.

### 5.3 Reliability

1. Semua response menggunakan format standar.
2. Error harus konsisten.
3. Apps Script menggunakan LockService untuk batch write.
4. Sheet header tidak boleh diubah sembarangan.

### 5.4 Compatibility

1. Browser modern: Chrome, Edge, Firefox.
2. Tampilan responsif desktop dan tablet.
3. Mobile minimal bisa melihat data dan laporan.

## 6. Format Error Standar

```json
{
  "success": false,
  "message": "Nilai harus antara 0 sampai 100",
  "errors": [
    {
      "field": "nilai",
      "message": "Nilai tidak valid"
    }
  ]
}
```

## 7. Audit Log

Aktivitas berikut harus dicatat:

1. Login sukses/gagal.
2. Tambah/edit/nonaktif siswa.
3. Simpan nilai.
4. Edit nilai.
5. Simpan hafalan.
6. Edit hafalan.
7. Generate/cetak laporan, opsional.
