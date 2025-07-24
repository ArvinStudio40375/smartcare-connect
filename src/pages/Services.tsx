import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  nama_layanan: string;
  description: string;
  base_price: number;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('layanan')
        .select('*');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Gagal memuat layanan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderService = async (service: Service) => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(sessionUser);
    console.log('User data:', userData); // Debug log

    // Generate a UUID for user_id if it doesn't exist
    const userId = userData.id || crypto.randomUUID();

    try {
      const { error } = await supabase
        .from('tagihan')
        .insert({
          user_id: userId,
          layanan_id: service.id,
          mitra_id: null, // Will be assigned later by admin
          nominal: service.base_price,
          status: 'pending',
          order_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Pesanan berhasil",
        description: `Layanan ${service.nama_layanan} telah dipesan`,
      });
    } catch (error) {
      console.error('Error ordering service:', error);
      toast({
        title: "Error",
        description: "Gagal memesan layanan",
        variant: "destructive"
      });
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
            <h1 className="text-lg font-bold">Layanan Jasa</h1>
            <p className="text-white/80 text-sm">Pilih layanan yang Anda butuhkan</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Memuat layanan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-warning rounded-full flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{service.nama_layanan}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          Rp {service.base_price?.toLocaleString('id-ID') || 0}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleOrderService(service)}
                          className="bg-gradient-to-r from-primary to-warning"
                        >
                          Pesan
                        </Button>
                      </div>
                    </div>
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

export default Services;