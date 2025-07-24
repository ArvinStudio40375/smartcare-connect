import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Receipt, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Bill {
  id: string;
  layanan: {
    nama_layanan: string;
  } | null;
  nominal: number;
  status: string;
  order_date: string;
  payment_method?: string;
}

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingBill, setPayingBill] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(sessionUser);

    try {
      const { data, error } = await supabase
        .from('tagihan')
        .select(`
          *,
          layanan (nama_layanan)
        `)
        .eq('user_id', userData.id)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setBills((data as any) || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: "Error",
        description: "Gagal memuat tagihan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const payBill = async (bill: Bill) => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) return;

    const userData = JSON.parse(sessionUser);
    setPayingBill(bill.id);

    try {
      // Check user balance
      const { data: userBalance, error: balanceError } = await supabase
        .from('users')
        .select('saldo')
        .eq('id', userData.id)
        .single();

      if (balanceError) throw balanceError;

      if (userBalance.saldo < bill.nominal) {
        toast({
          title: "Saldo tidak mencukupi",
          description: "Silakan top up saldo terlebih dahulu",
          variant: "destructive"
        });
        return;
      }

      // Deduct balance and update bill status
      const { error: updateError } = await supabase
        .from('users')
        .update({ saldo: userBalance.saldo - bill.nominal })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      const { error: billError } = await supabase
        .from('tagihan')
        .update({ 
          status: 'completed',
          payment_method: 'saldo',
          completion_date: new Date().toISOString()
        })
        .eq('id', bill.id);

      if (billError) throw billError;

      toast({
        title: "Pembayaran berhasil",
        description: `Tagihan ${bill.layanan?.nama_layanan} telah dibayar`,
      });

      fetchBills();
    } catch (error) {
      console.error('Error paying bill:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan pembayaran",
        variant: "destructive"
      });
    } finally {
      setPayingBill(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Lunas';
      case 'pending': return 'Belum Bayar';
      case 'cancelled': return 'Dibatalkan';
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
            <h1 className="text-lg font-bold">Tagihan Saya</h1>
            <p className="text-white/80 text-sm">Lihat dan bayar tagihan</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Memuat tagihan...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada tagihan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {bill.layanan?.nama_layanan || 'Layanan tidak ditemukan'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bill.order_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(bill.status)}>
                      {getStatusText(bill.status)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        Rp {bill.nominal?.toLocaleString('id-ID') || 0}
                      </p>
                      {bill.payment_method && (
                        <p className="text-xs text-muted-foreground">
                          Dibayar via {bill.payment_method}
                        </p>
                      )}
                    </div>

                    {bill.status === 'pending' && (
                      <Button
                        onClick={() => payBill(bill)}
                        disabled={payingBill === bill.id}
                        className="bg-gradient-to-r from-primary to-warning"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {payingBill === bill.id ? "Memproses..." : "Bayar"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;