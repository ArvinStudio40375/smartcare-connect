import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const Register = () => {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Kata sandi tidak cocok",
          description: "Pastikan kata sandi dan konfirmasi sama",
          variant: "destructive"
        });
        return;
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.find((u: any) => u.email === email)) {
        toast({
          title: "Email sudah terdaftar",
          description: "Gunakan email lain atau masuk dengan akun yang sudah ada",
          variant: "destructive"
        });
        return;
      }

      // Add new user
      const newUser = {
        id: Date.now().toString(),
        nama,
        email,
        password,
        saldo: 0,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      toast({
        title: "Pendaftaran berhasil!",
        description: "Akun Anda telah dibuat. Silakan masuk.",
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-warning/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-warning rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">SC</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Daftar ke SmartCare</CardTitle>
          <CardDescription>Buat akun baru untuk menggunakan layanan kami</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;