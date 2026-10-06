import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Toast from './components/layout/Toast'
import ConfirmModal from './components/layout/ConfirmModal'
import DashboardView from './components/dashboard/DashboardView'
import RtDashboardView from './components/dashboard/RtDashboardView'
import WargaDashboardView from './components/dashboard/WargaDashboardView'
import WargaView from './components/warga/WargaView'
import WargaMapView from './components/warga/WargaMapView'
import IuranView from './components/iuran/IuranView'
import KasView from './components/kas/KasView'
import PortalMandiriView from './components/portal/PortalMandiriView'
import SettingsView from './components/settings/SettingsView'
import EventsView from './components/events/EventsView'
import DataAksesView from './components/admin/DataAksesView'
import PengaduanView from './components/pengaduan/PengaduanView'
import SuratView from './components/surat/SuratView'
import KasWargaView from './components/kas/KasWargaView'
import KontakDaruratView from './components/darurat/KontakDaruratView'

import KwitansiModal from './components/iuran/KwitansiModal'
import BayarModal from './components/iuran/BayarModal'
import VerifikasiBuktiModal from './components/iuran/VerifikasiBuktiModal'
import GenerateModal from './components/iuran/GenerateModal'
import TambahTagihanModal from './components/iuran/TambahTagihanModal'
import WargaModal from './components/warga/WargaModal'
import TransaksiKasModal from './components/kas/TransaksiKasModal'
import LoginAdminModal from './components/auth/LoginAdminModal'
import LoginPage from './components/auth/LoginPage'
import EditProfileModal from './components/profile/EditProfileModal'

function AppContent() {
  const { activeTab, loginModalOpen, closeLoginModal, currentUser, profileModalOpen, setProfileModalOpen } = useApp()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [tambahTagihanModalOpen, setTambahTagihanModalOpen] = useState(false)
  const [wargaModalOpen, setWargaModalOpen] = useState(false)
  const [editWargaData, setEditWargaData] = useState(null)
  const [kasModalOpen, setKasModalOpen] = useState(false)

  const handleOpenAddWarga = () => {
    setEditWargaData(null)
    setWargaModalOpen(true)
  }

  const handleOpenEditWarga = (warga) => {
    setEditWargaData(warga)
    setWargaModalOpen(true)
  }

  // Jika belum login, tampilkan Full-Page Login sesuai desain screenshot
  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 selection:bg-brand-500 selection:text-white">
      
      {/* Left Docked Sidebar */}
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenGenerate={() => setGenerateModalOpen(true)}
      />

      {/* Right Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        
        {/* Top Header Navbar */}
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenGenerate={() => setGenerateModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenGenerate={() => setGenerateModalOpen(true)}
                onOpenAddWarga={handleOpenAddWarga}
                onOpenAddKas={() => setKasModalOpen(true)}
              />
            )}

            {activeTab === 'rt-dashboard' && (
              <RtDashboardView
                onOpenGenerate={() => setGenerateModalOpen(true)}
                onOpenAddWarga={handleOpenAddWarga}
                onOpenAddKas={() => setKasModalOpen(true)}
              />
            )}

            {(activeTab === 'warga-dashboard' || activeTab === 'portal') && (
              <WargaDashboardView />
            )}

            {activeTab === 'warga' && (
              <WargaView
                onOpenAddWarga={handleOpenAddWarga}
                onEditWarga={handleOpenEditWarga}
              />
            )}

            {activeTab === 'peta-warga' && (
              <WargaMapView
                onEditWarga={handleOpenEditWarga}
              />
            )}

            {activeTab === 'iuran' && (
              <IuranView
                onOpenGenerate={() => setGenerateModalOpen(true)}
                onOpenTambahTagihan={() => setTambahTagihanModalOpen(true)}
              />
            )}

            {activeTab === 'events' && (
              <EventsView />
            )}

            {activeTab === 'kas' && (
              <KasView
                onOpenAddKas={() => setKasModalOpen(true)}
              />
            )}

            {activeTab === 'pengaduan' && (
              <PengaduanView />
            )}

            {activeTab === 'surat' && (
              <SuratView />
            )}

            {activeTab === 'kas-warga' && (
              <KasWargaView />
            )}

            {activeTab === 'kontak-darurat' && (
              <KontakDaruratView />
            )}

            {activeTab === 'data-akses' && (
              <DataAksesView />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GenerateModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
      />

      <TambahTagihanModal
        isOpen={tambahTagihanModalOpen}
        onClose={() => setTambahTagihanModalOpen(false)}
      />

      <WargaModal
        isOpen={wargaModalOpen}
        onClose={() => setWargaModalOpen(false)}
        editWarga={editWargaData}
      />

      <TransaksiKasModal
        isOpen={kasModalOpen}
        onClose={() => setKasModalOpen(false)}
      />

      <BayarModal />
      <VerifikasiBuktiModal />
      <KwitansiModal />
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Admin Login Modal */}
      <LoginAdminModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
      />

      {/* Toast Notification */}
      <Toast />

      {/* Modern Permission/Confirmation Dialog */}
      <ConfirmModal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
