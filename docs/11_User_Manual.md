# User Manual

## 1. Login

1. Buka URL aplikasi.
2. Masukkan email.
3. Masukkan password.
4. Klik Masuk.
5. Setelah berhasil, pengguna masuk ke dashboard.

Jika gagal login:

- Pastikan email benar.
- Pastikan password benar.
- Hubungi admin jika akun nonaktif.

## 2. Dashboard

Dashboard menampilkan ringkasan:

- Total siswa.
- Total kelas.
- Rata-rata nilai.
- Progres hafalan.
- Siswa yang perlu perhatian.

## 3. Mengelola Siswa

Role: Admin.

### Tambah Siswa

1. Buka menu Data Master.
2. Pilih Siswa.
3. Klik Tambah.
4. Isi data siswa.
5. Klik Simpan.

### Edit Siswa

1. Buka daftar siswa.
2. Cari siswa.
3. Klik Edit.
4. Ubah data.
5. Klik Simpan.

### Nonaktifkan Siswa

1. Buka daftar siswa.
2. Klik aksi Nonaktifkan.
3. Konfirmasi.

## 4. Mengelola Kelas

Role: Admin.

1. Buka menu Data Master.
2. Pilih Kelas.
3. Klik Tambah/Edit.
4. Isi nama kelas, tingkat, wali kelas, dan tahun ajaran.
5. Klik Simpan.

## 5. Mengelola Guru

Role: Admin.

1. Buka menu Data Master.
2. Pilih Guru.
3. Tambah atau edit data guru.
4. Pilih role guru.
5. Klik Simpan.

## 6. Mengelola Mata Pelajaran

Role: Admin.

1. Buka menu Data Master.
2. Pilih Mata Pelajaran.
3. Klik Tambah.
4. Isi nama mapel.
5. Pilih guru pengampu.
6. Klik Simpan.

## 7. Input Nilai

Role: Guru Mapel/Admin.

1. Buka menu Nilai.
2. Pilih Input Nilai.
3. Pilih kelas.
4. Pilih mata pelajaran.
5. Pilih semester.
6. Pilih tahun ajaran.
7. Pilih jenis nilai.
8. Klik Tampilkan Siswa.
9. Isi nilai dan catatan.
10. Klik Simpan Semua Nilai.

Catatan:

- Nilai harus 0 sampai 100.
- Siswa nonaktif tidak ditampilkan.
- Data yang sudah ada dapat diperbarui.

## 8. Rekap Nilai

Role: Admin, Guru Mapel, Wali Kelas, Kepala Sekolah.

1. Buka menu Nilai.
2. Pilih Rekap Nilai.
3. Pilih filter.
4. Klik Tampilkan.
5. Lihat hasil rekap.
6. Klik Cetak jika dibutuhkan.

## 9. Input Hafalan

Role: Guru Tahfidz/Admin.

1. Buka menu Hafalan Al-Qur’an.
2. Pilih Input Hafalan.
3. Pilih kelas.
4. Pilih siswa.
5. Isi juz.
6. Isi surah.
7. Isi nomor surah.
8. Isi ayat awal dan ayat akhir.
9. Isi tanggal setor.
10. Pilih status hafalan.
11. Isi nilai kelancaran, tajwid, makhraj, dan adab.
12. Isi catatan.
13. Klik Simpan Hafalan.

Catatan:

- Juz harus 1 sampai 30.
- Nomor surah harus 1 sampai 114.
- Ayat awal tidak boleh lebih besar dari ayat akhir.
- Nilai aspek harus 1 sampai 100.

## 10. Riwayat Hafalan

1. Buka menu Hafalan.
2. Pilih Riwayat Hafalan.
3. Pilih kelas dan siswa.
4. Riwayat hafalan akan tampil berdasarkan tanggal setor.

## 11. Rekap Hafalan

1. Buka menu Hafalan.
2. Pilih Rekap Hafalan.
3. Pilih filter kelas, siswa, juz, atau status.
4. Klik Tampilkan.
5. Klik Cetak jika dibutuhkan.

## 12. Cetak Laporan

1. Buka menu Laporan.
2. Pilih Laporan Nilai atau Laporan Hafalan.
3. Pilih filter siswa/kelas/tahun ajaran.
4. Klik Tampilkan.
5. Klik Cetak.
6. Pilih printer atau Save as PDF.

## 13. Logout

1. Klik nama user atau tombol Logout.
2. Session akan dihapus.
3. User kembali ke halaman login.

## 14. Panduan Error Umum

| Pesan | Arti | Solusi |
|---|---|---|
| Email atau password salah | Login gagal | Cek ulang data login |
| Akun nonaktif | User tidak aktif | Hubungi admin |
| Nilai tidak valid | Nilai di luar range | Isi 0 sampai 100 |
| Juz tidak valid | Juz di luar range | Isi 1 sampai 30 |
| Unauthorized | Token/koneksi backend bermasalah | Hubungi developer/admin |
| Data belum tersedia | Filter tidak menemukan data | Ubah filter atau tambah data |
