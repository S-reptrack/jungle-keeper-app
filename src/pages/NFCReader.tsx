import { NFCReader as NFCReaderComponent } from '@/components/NFCReaderNew';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NFCReader = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <div className="container max-w-2xl mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>
        <NFCReaderComponent />
      </main>
    </div>
  );
};

export default NFCReader;
