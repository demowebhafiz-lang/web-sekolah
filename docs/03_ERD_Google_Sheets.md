# ERD dan Struktur Google Sheets

## 1. Konsep Database

Database menggunakan satu Google Spreadsheet dengan beberapa sheet sebagai tabel.

## 2. Daftar Sheet

| Sheet | Fungsi |
|---|---|
| Users | Data login dan role |
| Siswa | Data siswa/siswi |
| Kelas | Data kelas |
| Guru | Data guru |
| Mapel | Data mata pelajaran |
| Nilai | Data nilai akademik |
| Hafalan | Data hafalan Al-Qur’an |
| TahunAjaran | Data tahun ajaran |
| Sessions | Session/token user, opsional |
| Logs | Audit log |

## 3. Relasi Data

```txt
Users.userId 1---0..1 Guru.userId

Kelas.kelasId 1---* Siswa.kelasId
Kelas.kelasId 1---* Nilai.kelasId
Kelas.kelasId 1---* Hafalan.kelasId

Guru.guruId 1---* Mapel.guruId
Guru.guruId 1---* Nilai.guruId
Guru.guruId 1---* Hafalan.guruTahfidzId

Siswa.siswaId 1---* Nilai.siswaId
Siswa.siswaId 1---* Hafalan.siswaId

Mapel.mapelId 1---* Nilai.mapelId
```

## 4. Sheet Users

Header:

```txt
userId | nama | email | passwordHash | role | guruId | siswaId | status | lastLoginAt | createdAt | updatedAt
```

Contoh:

```txt
USR001 | Admin Sekolah | admin@example.com | HASH | admin |  |  | aktif | 2026-05-23T10:00:00Z | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

Role valid:

```txt
super_admin, admin, guru_mapel, guru_tahfidz, wali_kelas, kepala_sekolah, orang_tua
```

## 5. Sheet Siswa

Header:

```txt
siswaId | nis | nisn | namaLengkap | jenisKelamin | tempatLahir | tanggalLahir | kelasId | namaOrangTua | noHpOrangTua | alamat | status | createdAt | updatedAt
```

Contoh:

```txt
SIS001 | 2026001 |  | Ahmad Fauzi | L | Jakarta | 2015-01-10 | KLS001 | Bapak Abdullah | 08123456789 | Jakarta | aktif | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 6. Sheet Kelas

Header:

```txt
kelasId | namaKelas | tingkat | waliKelasId | tahunAjaran | status | createdAt | updatedAt
```

Contoh:

```txt
KLS001 | 1A | 1 | GR001 | 2026/2027 | aktif | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 7. Sheet Guru

Header:

```txt
guruId | userId | namaGuru | email | noHp | roleGuru | status | createdAt | updatedAt
```

Contoh:

```txt
GR001 | USR002 | Ustadz Ahmad | ahmad@example.com | 0811111111 | guru_tahfidz | aktif | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 8. Sheet Mapel

Header:

```txt
mapelId | namaMapel | kelompok | guruId | status | createdAt | updatedAt
```

Contoh:

```txt
MPL001 | Matematika | Umum | GR002 | aktif | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 9. Sheet Nilai

Header:

```txt
nilaiId | siswaId | kelasId | mapelId | guruId | semester | tahunAjaran | jenisNilai | nilai | predikat | catatan | tanggalInput | createdAt | updatedAt
```

Contoh:

```txt
NIL001 | SIS001 | KLS001 | MPL001 | GR002 | Ganjil | 2026/2027 | harian | 85 | B | Baik | 2026-05-23 | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

Unique key rekomendasi:

```txt
siswaId + mapelId + semester + tahunAjaran + jenisNilai
```

## 10. Sheet Hafalan

Header:

```txt
hafalanId | siswaId | kelasId | guruTahfidzId | juz | surah | nomorSurah | ayatAwal | ayatAkhir | tanggalSetor | statusHafalan | nilaiKelancaran | nilaiTajwid | nilaiMakhraj | nilaiAdab | rataRata | catatan | createdAt | updatedAt
```

Contoh:

```txt
HAF001 | SIS001 | KLS001 | GR001 | 30 | An-Naba | 78 | 1 | 10 | 2026-05-23 | lancar | 90 | 85 | 88 | 95 | 89.5 | Lancar | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 11. Sheet TahunAjaran

Header:

```txt
tahunAjaranId | namaTahunAjaran | semesterAktif | status | createdAt | updatedAt
```

Contoh:

```txt
TA001 | 2026/2027 | Ganjil | aktif | 2026-05-23T09:00:00Z | 2026-05-23T09:00:00Z
```

## 12. Sheet Sessions

Header:

```txt
sessionId | userId | token | expiredAt | status | createdAt | updatedAt
```

Catatan: untuk MVP bisa disederhanakan memakai token statis aplikasi + data user di localStorage. Untuk sistem lebih aman, gunakan Sessions.

## 13. Sheet Logs

Header:

```txt
logId | userId | action | entity | entityId | detail | ipAddress | userAgent | createdAt
```

## 14. Aturan ID

Gunakan prefix agar mudah dibaca:

| Entity | Prefix | Contoh |
|---|---|---|
| User | USR | USR001 |
| Siswa | SIS | SIS001 |
| Kelas | KLS | KLS001 |
| Guru | GR | GR001 |
| Mapel | MPL | MPL001 |
| Nilai | NIL | NIL001 |
| Hafalan | HAF | HAF001 |
| Log | LOG | LOG001 |

Untuk implementasi cepat bisa menggunakan UUID:

```javascript
Utilities.getUuid()
```

## 15. Rekomendasi Proteksi Sheet

1. Baris header dikunci.
2. Hanya owner spreadsheet yang bisa mengedit struktur kolom.
3. Apps Script yang melakukan penulisan data.
4. Sheet Logs tidak diedit manual.
