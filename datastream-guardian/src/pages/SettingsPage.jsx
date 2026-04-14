const SettingsPage = () => {
    return (<div className="space-y-6">
      <h2 className="text-xl font-bold text-card-foreground">⚙️ Pengaturan</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flood-card space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground">Umum</h3>
          <div>
            <label className="text-xs text-muted-foreground">Nama Sistem</label>
            <input defaultValue="Sistem Peringatan Banjir Desa" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Interval Refresh Data (detik)</label>
            <input type="number" defaultValue={5} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"/>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Zona Waktu</label>
            <select defaultValue="WIB" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted border border-border text-card-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
              <option>WIB</option>
              <option>WITA</option>
              <option>WIT</option>
            </select>
          </div>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90">Simpan Pengaturan</button>
        </div>

        <div className="flood-card space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground">Tentang Sistem</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Versi: <span className="text-card-foreground">1.0.0</span></p>
            <p>Platform: <span className="text-card-foreground">IoT + Machine Learning</span></p>
            <p>Database: <span className="text-card-foreground">Belum terhubung</span></p>
            <p>Lisensi: <span className="text-card-foreground">Open Source</span></p>
          </div>
        </div>
      </div>
    </div>);
};
export default SettingsPage;
