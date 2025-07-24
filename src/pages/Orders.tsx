import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  layanan: {
    nama_layanan: string;
  } | null;
  nominal: number;
  status: string;
  order_date: string;
  completion_date?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
          layanan!tagihan_layanan_id_fkey (nama_layanan)
        `)
        .eq('user_id', userData.id)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat riwayat pesanan",
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
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'pending': return 'Menunggu';
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
            <h1 className="text-lg font-bold">Riwayat Pesanan</h1>
            <p className="text-white/80 text-sm">Lihat semua pesanan Anda</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Memuat riwayat pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">
                      {order.layanan?.nama_layanan || 'Layanan tidak ditemukan'}
                    </h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tanggal: {new Date(order.order_date).toLocaleDateString('id-ID')}
                  </p>
                  {order.completion_date && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Selesai: {new Date(order.completion_date).toLocaleDateString('id-ID')}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-primary">
                      Rp {order.nominal?.toLocaleString('id-ID') || 0}
                    </p>
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

export default Orders;