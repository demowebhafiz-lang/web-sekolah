import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import { ADMIN_ROLES, ROUTE_ROLES } from './features/auth/roles.js';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import GuruFormPage from './features/guru/GuruFormPage.jsx';
import GuruListPage from './features/guru/GuruListPage.jsx';
import HafalanInputPage from './features/hafalan/HafalanInputPage.jsx';
import HafalanRekapPage from './features/hafalan/HafalanRekapPage.jsx';
import HafalanRiwayatPage from './features/hafalan/HafalanRiwayatPage.jsx';
import KelasFormPage from './features/kelas/KelasFormPage.jsx';
import KelasListPage from './features/kelas/KelasListPage.jsx';
import LaporanSiswaPage from './features/laporan/LaporanSiswaPage.jsx';
import MapelFormPage from './features/mapel/MapelFormPage.jsx';
import MapelListPage from './features/mapel/MapelListPage.jsx';
import NilaiInputPage from './features/nilai/NilaiInputPage.jsx';
import NilaiRekapPage from './features/nilai/NilaiRekapPage.jsx';
import SettingsPage from './features/settings/SettingsPage.jsx';
import SiswaFormPage from './features/siswa/SiswaFormPage.jsx';
import SiswaListPage from './features/siswa/SiswaListPage.jsx';
import SiswaProfilePage from './features/siswa/SiswaProfilePage.jsx';

function protectedPage(element, allowedRoles) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={protectedPage(<DashboardPage />, ROUTE_ROLES.dashboard)} />
        <Route
          path="siswa"
          element={protectedPage(<SiswaListPage />, ROUTE_ROLES.siswa)}
        />
        <Route
          path="siswa/tambah"
          element={protectedPage(<SiswaFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="siswa/:siswaId/edit"
          element={protectedPage(<SiswaFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="siswa/:siswaId"
          element={protectedPage(<SiswaProfilePage />, ROUTE_ROLES.siswa)}
        />
        <Route
          path="kelas"
          element={protectedPage(<KelasListPage />, ROUTE_ROLES.kelas)}
        />
        <Route
          path="kelas/tambah"
          element={protectedPage(<KelasFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="kelas/:kelasId/edit"
          element={protectedPage(<KelasFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="guru"
          element={protectedPage(<GuruListPage />, ROUTE_ROLES.guru)}
        />
        <Route
          path="guru/tambah"
          element={protectedPage(<GuruFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="guru/:guruId/edit"
          element={protectedPage(<GuruFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="mapel"
          element={protectedPage(<MapelListPage />, ROUTE_ROLES.mapel)}
        />
        <Route
          path="mapel/tambah"
          element={protectedPage(<MapelFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="mapel/:mapelId/edit"
          element={protectedPage(<MapelFormPage />, ADMIN_ROLES)}
        />
        <Route
          path="nilai/input"
          element={protectedPage(<NilaiInputPage />, ROUTE_ROLES.inputNilai)}
        />
        <Route
          path="nilai/rekap"
          element={protectedPage(<NilaiRekapPage />, ROUTE_ROLES.rekapNilai)}
        />
        <Route
          path="hafalan/input"
          element={protectedPage(<HafalanInputPage />, ROUTE_ROLES.inputHafalan)}
        />
        <Route
          path="hafalan/riwayat"
          element={protectedPage(<HafalanRiwayatPage />, ROUTE_ROLES.riwayatHafalan)}
        />
        <Route
          path="hafalan/rekap"
          element={protectedPage(<HafalanRekapPage />, ROUTE_ROLES.rekapHafalan)}
        />
        <Route
          path="laporan"
          element={protectedPage(<LaporanSiswaPage />, ROUTE_ROLES.laporan)}
        />
        <Route
          path="pengaturan"
          element={protectedPage(<SettingsPage />, ROUTE_ROLES.pengaturan)}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
