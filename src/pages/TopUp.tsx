import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TopUp = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const quickAmounts = [50000, 100000, 200000, 500000];

  const handleTopUp = async () => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    if (!amount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Harap isi semua field",
        variant: "destructive"
      });
      return;
    }

    const userData = JSON.parse(sessionUser);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('topup')
        .insert({
          user_id: userData.id,
          nominal: parseInt(amount),
          payment_method: paymentMethod,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Top Up berhasil",
        description: "Permintaan top up telah dikirim, menunggu konfirmasi admin",
      });

      setAmount("");
      setPaymentMethod("");
    } catch (error) {
      console.error('Error creating top up:', error);
      toast({
        title: "Error",
        description: "Gagal membuat permintaan top up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-lg font-bold">Top Up Saldo</h1>
            <p className="text-white/80 text-sm">Isi saldo untuk pembayaran</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-warning rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Top Up Saldo</h2>
                <p className="text-muted-foreground">Masukkan jumlah yang ingin ditambahkan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Jumlah Top Up</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masukkan jumlah"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Jumlah Cepat</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {quickAmounts.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="h-12"
                    >
                      Rp {quickAmount.toLocaleString('id-ID')}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="payment-method">Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="virtual_account">Virtual Account</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleTopUp}
                disabled={loading || !amount || !paymentMethod}
                className="w-full h-12 bg-gradient-to-r from-primary to-warning"
              >
                {loading ? "Memproses..." : "Top Up Sekarang"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Informasi</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum top up Rp 10.000</li>
              <li>• Proses verifikasi 1-24 jam</li>
              <li>• Hubungi admin jika ada kendala</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TopUp;