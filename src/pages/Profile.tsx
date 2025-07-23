import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Save, Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState({ nama: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(sessionUser);
    setUser(userData);
  }, [navigate]);

  const handleSave = () => {
    if (!user.nama || !user.email) {
      toast({
        title: "Error",
        description: "Nama dan email tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Update user data in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.email === user.email 
          ? { ...u, nama: user.nama, password: user.password || u.password }
          : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('sessionUser', JSON.stringify(user));

      toast({
        title: "Profil berhasil diperbarui",
        description: "Data profil Anda telah disimpan",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-warning text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Profil Saya</h1>
            <p className="text-white/80 text-sm">Kelola informasi akun</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-warning rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Informasi Profil</h2>
                <p className="text-muted-foreground">Kelola data pribadi Anda</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={user.nama}
                  onChange={(e) => setUser({ ...user, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="Masukkan email"
                  className="mt-1"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div>
                <Label htmlFor="password">Password Baru (Opsional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Kosongkan jika tidak ingin mengubah password
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-warning"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Aksi Akun</h3>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;