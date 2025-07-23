import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wrench, 
  History, 
  MessageCircle, 
  CreditCard, 
  Wallet, 
  Receipt, 
  User, 
  LogOut,
  Menu,
  X,
  Bell
} from "lucide-react";

interface User {
  email: string;
  nama: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(sessionUser);
    setUser(userData);

    // Fetch user balance from Supabase if user has ID, otherwise use localStorage
    if (userData.id) {
      fetchUserBalance(userData.id);
    } else {
      // Fallback to localStorage for users without Supabase ID
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.email === userData.email);
      if (currentUser) {
        setSaldo(currentUser.saldo || 0);
      }
    }
  }, [navigate]);

  const fetchUserBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('saldo')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setSaldo(data.saldo || 0);
        // Update localStorage with current balance
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userData = JSON.parse(localStorage.getItem('sessionUser') || '{}');
        const updatedUsers = users.map((user: any) => 
          user.email === userData.email 
            ? { ...user, saldo: data.saldo || 0 }
            : user
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      // Fallback to localStorage on error
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userData = JSON.parse(localStorage.getItem('sessionUser') || '{}');
      const currentUser = users.find((u: any) => u.email === userData.email);
      if (currentUser) {
        setSaldo(currentUser.saldo || 0);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionUser');
    toast({
      title: "Logout berhasil",
      description: "Terima kasih telah menggunakan SmartCare",
    });
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Wrench,
      title: "Layanan Jasa",
      description: "Pilih layanan yang Anda butuhkan",
      color: "from-blue-500 to-blue-600",
      path: "/services"
    },
    {
      icon: History,
      title: "Riwayat Pesanan",
      description: "Lihat semua pesanan Anda",
      color: "from-green-500 to-green-600",
      path: "/orders"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat dengan admin atau mitra",
      color: "from-purple-500 to-purple-600",
      path: "/chat"
    },
    {
      icon: CreditCard,
      title: "Top Up Saldo",
      description: "Isi saldo untuk pembayaran",
      color: "from-orange-500 to-orange-600",
      path: "/topup"
    },
    {
      icon: Wallet,
      title: "Saldo Saya",
      description: `Rp ${saldo.toLocaleString('id-ID')}`,
      color: "from-emerald-500 to-emerald-600",
      path: "/balance"
    },
    {
      icon: Receipt,
      title: "Tagihan Saya",
      description: "Lihat dan bayar tagihan",
      color: "from-red-500 to-red-600",
      path: "/bills"
    },
    {
      icon: User,
      title: "Profil Saya",
      description: "Kelola informasi akun",
      color: "from-indigo-500 to-indigo-600",
      path: "/profile"
    },
    {
      icon: LogOut,
      title: "Logout",
      description: "Keluar dari aplikasi",
      color: "from-gray-500 to-gray-600",
      action: handleLogout
    }
  ];

  const handleMenuClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    } else {
      toast({
        title: "Fitur dalam pengembangan",
        description: `${item.title} akan segera tersedia`,
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-warning text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-bold text-sm">SC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">SmartCare</h1>
              <p className="text-white/80 text-sm">Halo, {user.nama}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Balance Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-primary to-warning text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Saldo Anda</p>
                <p className="text-2xl font-bold">Rp {saldo.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Grid */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-foreground mb-4">Layanan Kami</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:scale-105 transition-all duration-200 border-0 shadow-md hover:shadow-lg"
                style={{ boxShadow: 'var(--shadow-card)' }}
                onClick={() => handleMenuClick(item)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            className="h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90"
            onClick={() => navigate('/services')}
          >
            <Wrench className="w-5 h-5 mr-2" />
            Pesan Layanan
          </Button>
          <Button 
            variant="outline" 
            className="h-14 border-primary text-primary hover:bg-primary/5"
            onClick={() => navigate('/topup')}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Top Up Saldo
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;