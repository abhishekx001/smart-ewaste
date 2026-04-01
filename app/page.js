'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { 
  Trash2, 
  MapPin, 
  AlertCircle, 
  Truck, 
  Menu, 
  X, 
  ArrowRight,
  Plus,
  History,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBins: 0,
    activeAlerts: 0,
    collectionsToday: 0,
    avgFillLevel: 0
  });
  const [locations, setLocations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locRes, compRes] = await Promise.all([
          fetch('/api/location'),
          fetch('/api/complaints')
        ]);
        
        const locData = await locRes.json();
        const compData = await compRes.json();
        
        const locs = locData.locations || [];
        const comps = compData.complaints || [];
        
        setLocations(locs);
        setComplaints(comps);
        
        const collectionsToday = locs.filter(l => l.status === 'collected').length;
        const activeAlerts = comps.filter(c => c.status !== 'resolved').length;
        
        setStats({
          totalBins: locs.length,
          activeAlerts: activeAlerts,
          collectionsToday: collectionsToday,
          avgFillLevel: locs.length > 0 ? 72 : 0
        });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-primary/10">
      {/* Role-Based Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-borderColor">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-textPrimary tracking-tight">EcoTrack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-textPrimary hover:text-primary transition-all duration-150">Home</Link>
            {status === 'authenticated' ? (
              <>
                <div className="h-4 w-px bg-borderColor"></div>
                {session?.user?.role === 'admin' && (
                  <>
                    <Link href="/add" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">Add Bin</Link>
                    <Link href="/collect" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">Bins Map</Link>
                    <Link href="/collected" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">Collection Logs</Link>
                    <Link href="/complaints" className="text-sm font-semibold text-primary px-3 py-1 bg-primary/5 rounded-md flex items-center gap-1.5 transition-all duration-150">
                      Manage Complaints
                      <span className="w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">{stats.activeAlerts}</span>
                    </Link>
                  </>
                )}
                {session?.user?.role === 'driver' && (
                  <>
                    <Link href="/collect" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">Collection Points</Link>
                    <Link href="/collected" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">History</Link>
                    <Link href="/complaints" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">My Dispatches</Link>
                  </>
                )}
                {session?.user?.role === 'user' && (
                  <>
                    <Link href="/complaints/new" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150 border-b border-dashed border-borderColor">Submit Problem</Link>
                    <Link href="/complaints" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">View My Activity</Link>
                  </>
                )}
                <div className="h-4 w-px bg-borderColor ml-2"></div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-0.5">{session?.user?.role}</span>
                    <span className="text-sm font-medium text-textPrimary leading-none">{session?.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-xs font-semibold text-danger hover:opacity-80 transition-opacity border-l border-borderColor pl-4"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="text-sm font-medium text-textMuted hover:text-primary transition-all duration-150">Sign In</Link>
                <Link href="/login" className="btn-primary flex items-center gap-2 text-sm leading-none">
                  Logistics Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-surface border border-borderColor rounded-lg text-textPrimary hover:bg-white transition-all active:scale-95" 
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-primary mb-4 italic">smart waste management</p>
          <h1 className="text-5xl lg:text-7xl font-semibold text-textPrimary mb-6 leading-[1.1] tracking-tight">
            Building cleaner urban environments through intelligent bin monitoring.
          </h1>
          <p className="text-lg text-textMuted mb-10 max-w-lg">
            EcoTrack integrates sensor data and optimized routes to eliminate bin overflow and reduce city-wide logistical costs.
          </p>
          <div className="flex items-center gap-6">
            {status === 'authenticated' ? (
              <Link href={session.user.role === 'user' ? "/complaints/new" : "/collect"} className="btn-primary px-8 py-3.5">
                {session.user.role === 'admin' ? 'Manage Network' : session.user.role === 'driver' ? 'View Tasks' : 'Report Issue'}
              </Link>
            ) : (
              <Link href="/login" className="btn-primary px-8 py-3.5">Get Started</Link>
            )}
            <Link href="/collect" className="btn-secondary px-8 py-3.5">See Live Map</Link>
          </div>
        </div>
        <div className="relative h-[480px] w-full rounded-sm overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=800" 
            alt="Smart City" 
            fill 
            className="object-cover" 
            priority
          />
        </div>
      </header>

      {/* Stats row */}
      <section className="bg-surface py-20 border-y border-borderColor">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Total Bins', value: stats.totalBins },
            { label: 'Active Alerts', value: stats.activeAlerts },
            { label: 'Collection Today', value: stats.collectionsToday },
            { label: 'Fill Level Avg', value: `${stats.avgFillLevel}%` }
          ].map((stat, i) => (
            <div key={i} className="pt-6 border-t-2 border-primary group">
              <p className="text-3xl font-semibold text-textPrimary leading-none mb-2">{stat.value}</p>
              <p className="text-sm text-textMuted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role-Specific Shortcut Cards for Admin Panel Feel */}
      {status === 'authenticated' && session?.user?.role === 'admin' && (
        <section className="py-24 max-w-[1280px] mx-auto px-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-8 uppercase tracking-widest italic opacity-50">Admin Quick Access</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/complaints" className="bg-surface border border-borderColor p-8 rounded-lg hover:bg-white transition-all group">
              <AlertCircle className="w-8 h-8 text-danger mb-4" />
              <h4 className="text-sm font-semibold mb-1">Manage Complaints</h4>
              <p className="text-xs text-textMuted italic">Review and dispatch driver responses to city alerts.</p>
            </Link>
            <Link href="/add" className="bg-surface border border-borderColor p-8 rounded-lg hover:bg-white transition-all group">
              <Plus className="w-8 h-8 text-primary mb-4" />
              <h4 className="text-sm font-semibold mb-1">Add Location</h4>
              <p className="text-xs text-textMuted italic">Register a new bin or sensor unit to the grid.</p>
            </Link>
            <Link href="/collect" className="bg-surface border border-borderColor p-8 rounded-lg hover:bg-white transition-all group">
              <MapPin className="w-8 h-8 text-secondary mb-4" />
              <h4 className="text-sm font-semibold mb-1">Bins Network</h4>
              <p className="text-sm font-semibold text-secondary">Monitor Live</p>
            </Link>
            <Link href="/collected" className="bg-surface border border-borderColor p-8 rounded-lg hover:bg-white transition-all group">
              <History className="w-8 h-8 text-textMuted mb-4" />
              <h4 className="text-sm font-semibold mb-1">Collection Logs</h4>
              <p className="text-xs text-textMuted italic">Audit histories of all bin collection activities.</p>
            </Link>
          </div>
        </section>
      )}

      {/* How it works section */}
      <section className="py-24 max-w-[1280px] mx-auto px-6">
        <h3 className="text-3xl font-semibold text-textPrimary mb-20 text-center italic uppercase">the ecosystem</h3>
        <div className="grid md:grid-cols-3 gap-0 divide-x divide-borderColor bg-white border border-borderColor rounded-sm overflow-hidden">
          {[
            {
              step: '01',
              title: 'bins are monitored',
              img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
              text: 'Sensors inside each bin track fill levels in real time and send data to the cloud dashboard instantly.'
            },
            {
              step: '02',
              title: 'alerts are triggered',
              img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400',
              text: 'When a bin reaches capacity, automated alerts notify the management team for immediate action.'
            },
            {
              step: '03',
              title: 'routes are optimized',
              img: 'https://images.unsplash.com/photo-1569144157591-c60f3f82f137?w=400',
              text: 'Collection vehicles follow smart optimized routes to empty only the bins that need it, saving time and fuel.'
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col p-8">
              <div className="relative h-56 w-full mb-8">
                <Image src={item.img} alt={item.title} fill className="object-cover rounded-none" />
              </div>
              <p className="text-xs font-semibold text-primary mb-2 italic">step {item.step}</p>
              <h4 className="text-lg font-semibold text-textPrimary mb-3">{item.title}</h4>
              <p className="text-sm text-textMuted leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="bg-surface border-y border-borderColor overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 items-stretch">
          <div className="relative h-[400px] lg:h-auto">
            <Image 
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600" 
              alt="Nature Sustainability" 
              fill 
              className="object-cover rounded-none" 
            />
          </div>
          <div className="p-16 lg:p-24 flex flex-col justify-center">
            <h3 className="text-3xl font-semibold text-textPrimary mb-12 italic">why it matters</h3>
            <div className="space-y-10">
              {[
                { title: 'real-time monitoring', desc: "track every bin's fill level live at any scale." },
                { title: 'automated alerts', desc: "get notified before any overflow situation occurs." },
                { title: 'route optimization', desc: "efficient fuel-saving collection path plans." },
                { title: 'analytics dashboard', desc: "data-driven insights for long-term city planning." }
              ].map((feat, i) => (
                <div key={i} className="border-l-2 border-primary pl-6">
                  <h4 className="text-sm font-semibold text-textPrimary mb-1">{feat.title}</h4>
                  <p className="text-xs text-textMuted italic">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent activity strip */}
      <section className="py-24 max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-2xl font-semibold text-textPrimary uppercase tracking-tight italic">recent activity</h3>
          <Link href="/complaints" className="text-xs font-medium text-textMuted border-b border-borderColor pb-1 hover:text-primary transition-colors italic">system audit view</Link>
        </div>
        <div className="border-t border-borderColor">
          {complaints.length > 0 ? (
            complaints.slice(0, 5).map((comp, i) => (
              <div key={i} className="grid grid-cols-12 items-center py-5 border-b border-borderColor text-sm text-textPrimary hover:bg-surface/50 transition-all px-2">
                <div className="col-span-1">
                  <AlertCircle className={`w-4 h-4 ${comp.status === 'resolved' ? 'text-secondary' : 'text-warning'}`} />
                </div>
                <div className="col-span-8 flex flex-col">
                  <span className="font-semibold">{comp.bin_location}</span>
                  <span className="text-xs text-textMuted truncate italic">"{comp.description}"</span>
                </div>
                <div className="col-span-3 text-right text-xs text-textMuted italic">
                  {new Date(comp.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-b border-borderColor">
              <p className="text-textMuted text-sm italic">no recent activity system-wide</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-secondary" />
              <span className="text-xl font-semibold text-white tracking-tight">EcoTrack</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
              <Link href="/collect" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">dashboard</Link>
              <Link href="/collect" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">bins network</Link>
              <Link href="/complaints" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">incident logs</Link>
              <Link href="/" className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-widest font-medium">system routes</Link>
            </div>
            <div className="text-xs text-secondary font-medium italic">
              &copy; 2026. all rights reserved.
            </div>
          </div>
          <div className="flex justify-center pt-12 border-t border-white/10">
            <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-bold">built for smart city waste logistics</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
        
        {/* Sliding Panel */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-8 shadow-2xl transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-12">
            <Link href="/" className="flex items-center gap-2" onClick={toggleSidebar}>
              <Trash2 className="w-5 h-5 text-primary" />
              <span className="text-xl font-semibold text-textPrimary tracking-tight">EcoTrack</span>
            </Link>
            <button 
              onClick={toggleSidebar} 
              className="w-10 h-10 flex items-center justify-center bg-surface border border-borderColor rounded-lg text-textPrimary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-12">
            {status === 'authenticated' ? (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic mb-1">active session</p>
                <p className="text-2xl font-semibold text-textPrimary leading-none">{session?.user?.name}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{session?.user?.role} access</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest italic mb-1">logistics portal</p>
                <p className="text-2xl font-semibold text-textPrimary leading-none italic uppercase">welcome back</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 flex-grow overflow-y-auto pr-2 pb-8">
             {status === 'authenticated' ? (
               <>
                 <Link href="/" className="group" onClick={toggleSidebar}>
                   <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Home</span>
                   <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">main control dashboard</p>
                 </Link>
                 
                 {session.user.role === 'admin' && (
                   <>
                    <Link href="/complaints" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-primary italic leading-none">Complaints</span>
                      <p className="text-[10px] text-primary/50 mt-1 uppercase tracking-widest font-medium italic">dispatch & resolution</p>
                    </Link>
                    <Link href="/add" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Add Bin</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">infrastructure growth</p>
                    </Link>
                    <Link href="/collect" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Bins Map</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">real-time monitoring</p>
                    </Link>
                    <Link href="/collected" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">History</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">collection archives</p>
                    </Link>
                   </>
                 )}

                 {session.user.role === 'driver' && (
                   <>
                    <Link href="/collect" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary leading-none italic">Route Map</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">active pickup routes</p>
                    </Link>
                    <Link href="/complaints" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary leading-none italic">My Tasks</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">assigned incidents</p>
                    </Link>
                    <Link href="/collected" className="group" onClick={toggleSidebar}>
                      <span className="text-3xl font-semibold text-textPrimary leading-none italic">My Logs</span>
                      <p className="text-[10px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">submission history</p>
                    </Link>
                   </>
                 )}

                 <button 
                  onClick={() => { signOut({ callbackUrl: '/' }); toggleSidebar(); }}
                  className="mt-4 text-left group"
                >
                  <span className="text-2xl font-semibold text-danger italic leading-none">Log Out</span>
                  <p className="text-[10px] text-danger/40 mt-1 uppercase tracking-widest font-medium italic">terminate active session</p>
                </button>
               </>
             ) : (
               <div className="flex flex-col gap-10">
                <Link href="/" className="group" onClick={toggleSidebar}>
                  <span className="text-4xl font-semibold text-textPrimary group-hover:text-primary transition-colors italic leading-none">Overview</span>
                  <p className="text-[11px] text-textMuted mt-1 uppercase tracking-widest font-medium italic">public network dashboard</p>
                </Link>
                <Link href="/login" className="group" onClick={toggleSidebar}>
                  <span className="text-4xl font-semibold text-primary italic leading-none tracking-tight">Login Portal</span>
                  <p className="text-[11px] text-primary/50 mt-1 uppercase tracking-widest font-medium italic">secure staff access</p>
                </Link>
               </div>
             )}
          </div>

          <div className="absolute bottom-10 left-8 right-8 pt-10 border-t border-borderColor">
            <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-borderColor">
              <div>
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">system status</p>
                <div className="flex items-center gap-1.5 font-semibold text-[10px] text-secondary">
                  <div className="w-1 h-1 bg-secondary rounded-full animate-pulse"></div>
                  NETWORK OPERATIONAL
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
