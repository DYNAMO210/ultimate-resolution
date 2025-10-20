import { useEffect, useState } from "react";
import bitcoinLogo from "@/assets/bitcoin.png";
import ethereumLogo from "@/assets/ethereum.png";
import bnbLogo from "@/assets/bnb.png";
import xrpLogo from "@/assets/xrp.png";
import cardanoLogo from "@/assets/cardano.png";
import solanaLogo from "@/assets/solana.png";
import dogecoinLogo from "@/assets/dogecoin.png";
import polkadotLogo from "@/assets/polkadot.png";
import avalancheLogo from "@/assets/avalanche.png";

const cryptoLogos = [
  { src: bitcoinLogo, alt: "Bitcoin", delay: 0 },
  { src: ethereumLogo, alt: "Ethereum", delay: 2 },
  { src: bnbLogo, alt: "BNB", delay: 4 },
  { src: xrpLogo, alt: "XRP", delay: 6 },
  { src: cardanoLogo, alt: "Cardano", delay: 8 },
  { src: solanaLogo, alt: "Solana", delay: 10 },
  { src: dogecoinLogo, alt: "Dogecoin", delay: 12 },
  { src: polkadotLogo, alt: "Polkadot", delay: 14 },
  { src: avalancheLogo, alt: "Avalanche", delay: 16 },
];

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[hsl(220,80%,6%)] via-[hsl(270,60%,10%)] to-[hsl(180,60%,15%)]">
      {/* Title Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <h1 
          className={`font-orbitron text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center px-4 transition-all duration-1000 ${
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
      </div>

      {/* 3D Flowing Crypto Logos */}
      <div 
        className="absolute inset-0 flex items-center overflow-hidden pointer-events-none"
        style={{ perspective: '1000px' }}
      >
        {/* Multiple rows for continuous flow effect */}
        {[0, 1, 2].map((rowIndex) => (
          <div
            key={rowIndex}
            className="absolute w-full"
            style={{
              top: `${30 + rowIndex * 20}%`,
            }}
          >
            {cryptoLogos.map((logo, index) => (
              <img
                key={`${rowIndex}-${index}`}
                src={logo.src}
                alt={logo.alt}
                className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain opacity-80 hover:opacity-100 transition-opacity"
                style={{
                  animation: `flow-3d ${20 + rowIndex * 2}s linear infinite`,
                  animationDelay: `${logo.delay + rowIndex * 1.5}s`,
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))',
                }}
                loading="eager"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Ambient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,80%,6%)] via-transparent to-[hsl(220,80%,6%)] opacity-60 pointer-events-none" />
    </main>
  );
};

export default Index;
