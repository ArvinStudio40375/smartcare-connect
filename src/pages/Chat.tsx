import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  message: string;
  sender_type: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(sessionUser));
    fetchMessages();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) return;

    const userData = JSON.parse(sessionUser);

    try {
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .or(`sender_id.eq.${userData.id},receiver_id.eq.${userData.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Gagal memuat pesan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const adminId = crypto.randomUUID();
      const { error } = await supabase
        .from('chat')
        .insert({
          sender_id: user.id,
          sender_type: 'user',
          receiver_id: adminId,
          receiver_type: 'admin',
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className="text-lg font-bold">Live Chat</h1>
            <p className="text-white/80 text-sm">Chat dengan admin atau mitra</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Mulai percakapan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-xs ${message.sender_id === user?.id ? 'bg-primary text-white' : 'bg-card'}`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {new Date(message.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            className="bg-gradient-to-r from-primary to-warning"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;