export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  GURU_MAPEL: 'guru_mapel',
  GURU_TAHFIDZ: 'guru_tahfidz',
  WALI_KELAS: 'wali_kelas',
  KEPALA_SEKOLAH: 'kepala_sekolah',
  ORANG_TUA: 'orang_tua'
};

export const ALL_STAFF_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.GURU_MAPEL,
  ROLES.GURU_TAHFIDZ,
  ROLES.WALI_KELAS,
  ROLES.KEPALA_SEKOLAH
];

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const ROUTE_ROLES = {
  dashboard: [...ALL_STAFF_ROLES, ROLES.ORANG_TUA],
  siswa: [...ADMIN_ROLES, ROLES.WALI_KELAS, ROLES.KEPALA_SEKOLAH],
  kelas: [...ADMIN_ROLES, ROLES.WALI_KELAS, ROLES.KEPALA_SEKOLAH],
  guru: [...ADMIN_ROLES, ROLES.KEPALA_SEKOLAH],
  mapel: [...ADMIN_ROLES, ROLES.KEPALA_SEKOLAH],
  inputNilai: [...ADMIN_ROLES, ROLES.GURU_MAPEL],
  rekapNilai: [...ADMIN_ROLES, ROLES.GURU_MAPEL, ROLES.WALI_KELAS, ROLES.KEPALA_SEKOLAH],
  inputHafalan: [...ADMIN_ROLES, ROLES.GURU_TAHFIDZ],
  riwayatHafalan: [...ADMIN_ROLES, ROLES.GURU_TAHFIDZ, ROLES.WALI_KELAS, ROLES.KEPALA_SEKOLAH],
  rekapHafalan: [...ADMIN_ROLES, ROLES.GURU_TAHFIDZ, ROLES.WALI_KELAS, ROLES.KEPALA_SEKOLAH],
  laporan: [...ALL_STAFF_ROLES, ROLES.ORANG_TUA],
  pengaturan: ADMIN_ROLES
};

export function canAccess(userRole, allowedRoles = []) {
  if (!allowedRoles.length) {
    return true;
  }

  return allowedRoles.includes(userRole);
}

export function formatRole(role = '') {
  return role.replaceAll('_', ' ') || 'user';
}
