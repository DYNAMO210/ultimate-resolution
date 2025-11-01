import { useEffect, useState } from "react";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { Button } from "@/components/ui/button";

const Index = () => {
  // Wallet connection page
  const [mounted, setMounted] = useState(false);
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Title Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-12">
        <h1 
          className={`font-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-center px-4 transition-all duration-1000 tracking-wide ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
          style={{
            background: 'linear-gradient(90deg, hsl(180, 100%, 50%), hsl(270, 80%, 60%), hsl(180, 100%, 50%))',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}
        >
          ULTIMATE
          <br />
          BLOCKCHAIN
          <br />
          RESOLUTION
        </h1>

        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            onClick={() => open()}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-6 text-lg"
          >
            Connect Wallet
          </Button>
        </div>
      </div>

      {/* Ambient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60 pointer-events-none" />
    </main>
  );
};

export default Index;
