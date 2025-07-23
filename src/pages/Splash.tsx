import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const sessionUser = localStorage.getItem('sessionUser');
      if (sessionUser) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-warning flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-warning rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SC</span>
            </div>
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-white/30 rounded-full animate-ping"></div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">SmartCare</h1>
        <p className="text-white/80 text-lg">Layanan Terpercaya untuk Anda</p>
        
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;