# Test Case dan QA Checklist

## 1. Auth

| ID | Skenario | Langkah | Expected Result |
|---|---|---|---|
| TC-AUTH-001 | Login valid | Masukkan email dan password benar | User masuk dashboard |
| TC-AUTH-002 | Password salah | Masukkan password salah | Error muncul |
| TC-AUTH-003 | User nonaktif | Login dengan user nonaktif | Login ditolak |
| TC-AUTH-004 | Logout | Klik logout | Session terhapus dan kembali login |
| TC-AUTH-005 | Akses tanpa login | Buka URL dashboard langsung | Redirect ke login |

## 2. Role Access

| ID | Skenario | Expected Result |
|---|---|---|
| TC-ROLE-001 | Guru mapel buka menu hafalan input | Ditolak/disembunyikan |
| TC-ROLE-002 | Guru tahfidz buka input nilai | Ditolak/disembunyikan |
| TC-ROLE-003 | Wali kelas buka CRUD siswa | Hanya lihat, tidak bisa edit |
| TC-ROLE-004 | Admin buka data master | Bisa akses penuh |
| TC-ROLE-005 | Kepala sekolah buka dashboard | Bisa melihat dashboard dan laporan |

## 3. Data Siswa

| ID | Skenario | Expected Result |
|---|---|---|
| TC-SISWA-001 | Tambah siswa valid | Data tersimpan |
| TC-SISWA-002 | Nama kosong | Error validasi |
| TC-SISWA-003 | NIS duplikat | Error NIS sudah digunakan |
| TC-SISWA-004 | Edit kelas siswa | Kelas berubah |
| TC-SISWA-005 | Nonaktifkan siswa | Status menjadi nonaktif |
| TC-SISWA-006 | Filter kelas | Hanya siswa kelas tersebut tampil |

## 4. Kelas

| ID | Skenario | Expected Result |
|---|---|---|
| TC-KELAS-001 | Tambah kelas | Data tersimpan |
| TC-KELAS-002 | Nama kelas kosong | Error validasi |
| TC-KELAS-003 | Edit wali kelas | Wali kelas berubah |
| TC-KELAS-004 | Nonaktifkan kelas | Status nonaktif |

## 5. Guru

| ID | Skenario | Expected Result |
|---|---|---|
| TC-GURU-001 | Tambah guru | Data tersimpan |
| TC-GURU-002 | Email duplikat | Error |
| TC-GURU-003 | Edit role guru | Role berubah |
| TC-GURU-004 | Nonaktifkan guru | Status nonaktif |

## 6. Mata Pelajaran

| ID | Skenario | Expected Result |
|---|---|---|
| TC-MAPEL-001 | Tambah mapel | Data tersimpan |
| TC-MAPEL-002 | Nama mapel kosong | Error |
| TC-MAPEL-003 | Set guru pengampu | Relasi guru tersimpan |
| TC-MAPEL-004 | Nonaktifkan mapel | Status nonaktif |

## 7. Nilai

| ID | Skenario | Expected Result |
|---|---|---|
| TC-NILAI-001 | Pilih kelas | Siswa kelas tampil |
| TC-NILAI-002 | Input nilai valid | Nilai tersimpan |
| TC-NILAI-003 | Nilai lebih dari 100 | Error |
| TC-NILAI-004 | Nilai kurang dari 0 | Error |
| TC-NILAI-005 | Simpan massal | Semua nilai valid tersimpan |
| TC-NILAI-006 | Input data yang sama | Data lama diupdate atau muncul konfirmasi |
| TC-NILAI-007 | Rekap nilai | Rata-rata muncul benar |
| TC-NILAI-008 | Filter mapel | Hanya mapel terpilih tampil |

## 8. Hafalan

| ID | Skenario | Expected Result |
|---|---|---|
| TC-HAFALAN-001 | Input hafalan valid | Data tersimpan |
| TC-HAFALAN-002 | Juz 31 | Error |
| TC-HAFALAN-003 | Nomor surah 115 | Error |
| TC-HAFALAN-004 | Ayat awal lebih besar dari ayat akhir | Error |
| TC-HAFALAN-005 | Nilai tajwid 101 | Error |
| TC-HAFALAN-006 | Rata-rata otomatis | Rata-rata benar |
| TC-HAFALAN-007 | Riwayat hafalan siswa | Data tampil urut tanggal |
| TC-HAFALAN-008 | Filter status perlu perbaikan | Data sesuai status tampil |

## 9. Dashboard

| ID | Skenario | Expected Result |
|---|---|---|
| TC-DASH-001 | Buka dashboard | Statistik tampil |
| TC-DASH-002 | Data kosong | Tidak error, tampil 0 |
| TC-DASH-003 | Ada data nilai/hafalan | Statistik berubah sesuai data |

## 10. Laporan

| ID | Skenario | Expected Result |
|---|---|---|
| TC-LAP-001 | Cetak laporan nilai | Dialog print terbuka |
| TC-LAP-002 | Cetak laporan hafalan | Dialog print terbuka |
| TC-LAP-003 | Filter siswa | Laporan hanya untuk siswa tersebut |
| TC-LAP-004 | Data kosong | Pesan data belum tersedia |

## 11. API dan Security

| ID | Skenario | Expected Result |
|---|---|---|
| TC-API-001 | Request tanpa x-app-token | Ditolak |
| TC-API-002 | Request token salah | Ditolak |
| TC-API-003 | Action tidak dikenal | Error action tidak dikenal |
| TC-API-004 | Session token kosong untuk data siswa | Ditolak |
| TC-API-005 | Role tidak sesuai | Ditolak |
| TC-API-006 | Payload tidak valid | Error validasi |

## 12. Deployment

| ID | Skenario | Expected Result |
|---|---|---|
| TC-DEP-001 | Vercel env belum diisi | Frontend gagal request dengan pesan jelas |
| TC-DEP-002 | URL Apps Script salah | Error koneksi |
| TC-DEP-003 | Token Vercel dan Apps Script beda | Unauthorized |
| TC-DEP-004 | Token sama | Request berhasil |

## 13. Checklist Sebelum Production

- [ ] Semua env Vercel sudah diisi.
- [ ] APP_API_TOKEN sudah diisi di Script Properties.
- [ ] SPREADSHEET_ID sudah diisi.
- [ ] Apps Script sudah deploy Web App.
- [ ] Semua header sheet sesuai ERD.
- [ ] Login admin berhasil.
- [ ] CRUD siswa berhasil.
- [ ] Input nilai berhasil.
- [ ] Input hafalan berhasil.
- [ ] Rekap tampil benar.
- [ ] Laporan bisa dicetak.
- [ ] Role access sudah diuji.
- [ ] Error message tampil ramah pengguna.
