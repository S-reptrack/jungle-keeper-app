import { NFCReader as NFCReaderComponent } from '@/components/NFCReaderNew';
import Navigation from '@/components/Navigation';

const NFCReader = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <NFCReaderComponent />
      </main>
    </div>
  );
};

export default NFCReader;
