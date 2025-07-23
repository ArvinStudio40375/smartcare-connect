import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Wallet, TrendingUp, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TopUpHistory {
  id: string;
  nominal: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const Balance = () => {
  const [balance, setBalance] = useState(0);
  const [topUpHistory, setTopUpHistory] = useState<TopUpHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(sessionUser);

    try {
      // Fetch user balance
      const { data: userBalance, error: balanceError } = await supabase
        .from('users')
        .select('saldo')
        .eq('id', userData.id)
        .single();

      if (balanceError) throw balanceError;
      setBalance(userBalance?.saldo || 0);

      // Update localStorage with current balance
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((user: any) => 
        user.email === userData.email 
          ? { ...user, saldo: userBalance?.saldo || 0 }
          : user
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Fetch top up history
      const { data: topUpData, error: topUpError } = await supabase
        .from('topup')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (topUpError) throw topUpError;
      setTopUpHistory(topUpData || []);

    } catch (error) {
      console.error('Error fetching balance data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data saldo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Berhasil';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      default: return status;
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
            <h1 className="text-lg font-bold">Saldo Saya</h1>
            <p className="text-white/80 text-sm">Kelola saldo Anda</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary to-warning text-white border-0 shadow-lg mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Saldo Anda</p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : `Rp ${balance.toLocaleString('id-ID')}`}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => navigate('/topup')}
            className="h-14 bg-gradient-to-r from-primary to-warning hover:from-primary/90 hover:to-warning/90"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Up
          </Button>
          <Button
            variant="outline"
            className="h-14 border-primary text-primary hover:bg-primary/5"
            onClick={() => fetchBalanceData()}
          >
            <History className="w-5 h-5 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Top Up History */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Riwayat Top Up</h3>
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat riwayat...</p>
            </div>
          ) : topUpHistory.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="p-6 text-center">
                <History className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Belum ada riwayat top up</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topUpHistory.map((topup) => (
                <Card key={topup.id} className="shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">
                          Rp {topup.nominal.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {topup.payment_method.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(topup.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(topup.status)}`}>
                        {getStatusText(topup.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Balance;