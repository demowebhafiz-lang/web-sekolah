function routeAction_(action, payload, token) {
  const publicRoutes = {
    login: login,
    getPublicSettings: getPublicSettings
  };

  const protectedRoutes = {
    getProfile: getProfile,
    logout: logout,
    getAppSettings: getAppSettings,
    updateAppSettings: updateAppSettings,
    uploadSchoolLogo: uploadSchoolLogo,

    getSiswaList: getSiswaList,
    createSiswa: createSiswa,
    updateSiswa: updateSiswa,
    deleteSiswa: deleteSiswa,
    uploadSiswaPhoto: uploadSiswaPhoto,
    deleteSiswaPhoto: deleteSiswaPhoto,
    createParentAccountForSiswa: createParentAccountForSiswa,
    resetParentPassword: resetParentPassword,
    updateParentLoginStatus: updateParentLoginStatus,
    getParentLoginInfo: getParentLoginInfo,

    getKelasList: getKelasList,
    createKelas: createKelas,
    updateKelas: updateKelas,
    deleteKelas: deleteKelas,

    getGuruList: getGuruList,
    createGuru: createGuru,
    updateGuru: updateGuru,
    deleteGuru: deleteGuru,
    createGuruLoginAccount: createGuruLoginAccount,
    resetGuruPassword: resetGuruPassword,
    updateGuruLoginStatus: updateGuruLoginStatus,
    getGuruLoginInfo: getGuruLoginInfo,

    getMapelList: getMapelList,
    createMapel: createMapel,
    updateMapel: updateMapel,
    deleteMapel: deleteMapel,

    bulkSaveNilai: bulkSaveNilai,
    updateNilai: updateNilai,
    getNilaiList: getNilaiList,
    getRekapNilai: getRekapNilai,

    createHafalan: createHafalan,
    updateHafalan: updateHafalan,
    getRiwayatHafalanSiswa: getRiwayatHafalanSiswa,
    getRekapHafalan: getRekapHafalan,

    getDashboardSummary: getDashboardSummary
  };

  if (publicRoutes[action]) {
    return publicRoutes[action](payload);
  }

  if (!protectedRoutes[action]) {
    throw new AppError_('Action tidak dikenal: ' + action, 404);
  }

  const user = requireSession_(token);
  return protectedRoutes[action](payload, user);
}
