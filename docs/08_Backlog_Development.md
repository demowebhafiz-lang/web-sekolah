# Development Backlog

## Epic 1: Setup Project

### TASK-001 Setup Repository

- Buat repository GitHub.
- Buat folder `frontend`, `apps-script`, dan `docs`.
- Tambahkan `.gitignore`.
- Tambahkan README.

Acceptance criteria:

- Repo bisa diclone.
- Struktur folder sesuai TDD.

### TASK-002 Setup React Vite

- Buat project Vite React.
- Install React Router.
- Install Tailwind.
- Buat layout dasar.

Acceptance criteria:

- `npm run dev` berjalan.
- Halaman login dan dashboard placeholder muncul.

### TASK-003 Setup Google Apps Script

- Buat project Apps Script.
- Buat `Code.gs`.
- Buat `doPost`.
- Buat helper response JSON.

Acceptance criteria:

- Endpoint Apps Script dapat menerima request test.

## Epic 2: Database Google Sheets

### TASK-004 Buat Spreadsheet Database

- Buat sheet Users.
- Buat sheet Siswa.
- Buat sheet Kelas.
- Buat sheet Guru.
- Buat sheet Mapel.
- Buat sheet Nilai.
- Buat sheet Hafalan.
- Buat sheet Logs.

Acceptance criteria:

- Semua header sesuai dokumen ERD.

### TASK-005 Setup Script Properties

- Tambahkan `SPREADSHEET_ID`.
- Tambahkan `APP_API_TOKEN`.

Acceptance criteria:

- Apps Script bisa membaca properties.

## Epic 3: Auth

### TASK-006 Backend Login

- Cari user berdasarkan email.
- Validasi password.
- Validasi status aktif.
- Generate session token.
- Return profile.

Acceptance criteria:

- Login berhasil dengan user valid.
- Login gagal dengan password salah.

### TASK-007 Frontend Login

- Buat halaman login.
- Integrasi action login.
- Simpan token ke localStorage.
- Redirect ke dashboard.

Acceptance criteria:

- User bisa login dan logout.

### TASK-008 Protected Route

- Buat ProtectedRoute.
- Redirect user belum login ke login.
- Batasi halaman berdasarkan role.

Acceptance criteria:

- User tanpa login tidak bisa masuk dashboard.

## Epic 4: Data Master

### TASK-009 CRUD Siswa Backend

Actions:

- getSiswaList
- createSiswa
- updateSiswa
- deleteSiswa

Acceptance criteria:

- Data siswa tersimpan di sheet Siswa.
- NIS tidak duplikat.

### TASK-010 CRUD Siswa Frontend

- List siswa.
- Filter kelas/status.
- Form tambah/edit.
- Soft delete/nonaktif.

Acceptance criteria:

- Admin dapat mengelola siswa dari UI.

### TASK-011 CRUD Kelas

- Backend dan frontend kelas.
- Filter status.
- Pilih wali kelas.

Acceptance criteria:

- Admin dapat mengelola kelas.

### TASK-012 CRUD Guru

- Backend dan frontend guru.
- Hubungkan guru dengan user.

Acceptance criteria:

- Admin dapat mengelola guru.

### TASK-013 CRUD Mapel

- Backend dan frontend mapel.
- Hubungkan mapel dengan guru.

Acceptance criteria:

- Admin dapat mengelola mapel.

## Epic 5: Nilai

### TASK-014 Backend bulkSaveNilai

- Validasi role.
- Validasi payload.
- Validasi nilai 0-100.
- Upsert berdasarkan unique key.
- Gunakan LockService.

Acceptance criteria:

- Nilai massal berhasil disimpan.
- Nilai di luar range ditolak.

### TASK-015 Frontend Input Nilai

- Filter kelas, mapel, semester, tahun ajaran, jenis nilai.
- Tampilkan siswa.
- Tabel input nilai.
- Simpan massal.

Acceptance criteria:

- Guru bisa input nilai satu kelas.

### TASK-016 Rekap Nilai

- Backend getRekapNilai.
- Frontend tabel rekap.
- Hitung rata-rata.

Acceptance criteria:

- Rekap muncul berdasarkan filter.

## Epic 6: Hafalan

### TASK-017 Backend createHafalan

- Validasi role guru tahfidz/admin.
- Validasi juz 1-30.
- Validasi surah 1-114.
- Validasi ayat.
- Hitung rata-rata.

Acceptance criteria:

- Hafalan tersimpan dan rata-rata benar.

### TASK-018 Frontend Input Hafalan

- Pilih kelas dan siswa.
- Form data hafalan.
- Auto hitung rata-rata.
- Simpan.

Acceptance criteria:

- Guru tahfidz dapat mencatat hafalan.

### TASK-019 Riwayat Hafalan

- Backend getRiwayatHafalanSiswa.
- Frontend tabel riwayat.

Acceptance criteria:

- Riwayat siswa tampil urut terbaru.

### TASK-020 Rekap Hafalan

- Backend getRekapHafalan.
- Frontend filter dan tabel.

Acceptance criteria:

- Rekap hafalan tampil per kelas/siswa/status.

## Epic 7: Dashboard dan Laporan

### TASK-021 Dashboard Summary

- Backend getDashboardSummary.
- Frontend kartu statistik.

Acceptance criteria:

- Dashboard menampilkan total siswa, kelas, nilai, hafalan.

### TASK-022 Laporan Nilai

- Halaman laporan nilai.
- Filter siswa/kelas/tahun.
- Print browser.

Acceptance criteria:

- Laporan dapat dicetak.

### TASK-023 Laporan Hafalan

- Halaman laporan hafalan.
- Filter siswa/kelas/juz/status.
- Print browser.

Acceptance criteria:

- Laporan dapat dicetak.

## Epic 8: Deployment

### TASK-024 Deploy Apps Script

- Deploy Web App.
- Set akses.
- Ambil URL deployment.
- Test endpoint.

Acceptance criteria:

- Endpoint bisa diakses frontend.

### TASK-025 Deploy Vercel

- Import repo GitHub.
- Set env Vercel.
- Deploy production.
- Test login.

Acceptance criteria:

- Aplikasi production berjalan.

## Sprint Rekomendasi

### Sprint 1

- Setup repo
- Setup React
- Setup Apps Script
- Setup Sheets
- Login

### Sprint 2

- CRUD siswa
- CRUD kelas
- CRUD guru
- CRUD mapel

### Sprint 3

- Input nilai
- Rekap nilai

### Sprint 4

- Input hafalan
- Riwayat hafalan
- Rekap hafalan

### Sprint 5

- Dashboard
- Laporan
- Testing
- Deployment
