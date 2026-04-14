import { Bell, Moon, Sun, User, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { useSensorHistoryQuery } from '@/features/sensor/hooks/useSensorQueries';
import { buildNotificationRows } from '@/features/sensor/utils/sensorMappers';
const Navbar = ({ darkMode, onToggleDark, onToggleSidebar }) => {
    const [showProfile, setShowProfile] = useState(false);
  const historyQuery = useSensorHistoryQuery();
  const unread = buildNotificationRows(historyQuery.data, 8).filter(n => !n.read).length;
    return (<header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
          <Menu className="w-5 h-5"/>
        </button>
        <div>
          <h2 className="text-base font-semibold text-card-foreground">📡 DataStream Guardian</h2>
          <p className="text-xs text-muted-foreground hidden sm:block">Realtime IoT Monitoring + Analytics</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onToggleDark} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>

        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground relative transition-colors">
          <Bell className="w-5 h-5"/>
          {unread > 0 && (<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-status-danger text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>)}
        </button>

        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground"/>
            </div>
            <span className="text-sm font-medium text-card-foreground hidden sm:block">Admin</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block"/>
          </button>
          {showProfile && (<div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
              <button className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-muted">Profil</button>
              <button className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-muted">Pengaturan</button>
              <hr className="border-border my-1"/>
              <button className="w-full text-left px-4 py-2 text-sm text-status-danger hover:bg-muted">Logout</button>
            </div>)}
        </div>
      </div>
    </header>);
};
export default Navbar;
