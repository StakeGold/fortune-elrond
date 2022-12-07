import React, { useState } from 'react';
import { useGetAccountInfo } from '@elrondnetwork/dapp-core/hooks';
import axios from 'axios';
import { EscrowService } from './escrow.service';

export const Dashboard = () => {
  const { address } = useGetAccountInfo();
  const [escrowAddressRaw, setEscrowAddressRaw] = useState('');
  const [escrowStatus, setEscrowStatus] = useState('');
  const [balance, setBalance] = useState('');
  const [fortune, setFortune] = useState('');
  const [recordingOracleUrl, setRecordingOracleUrl] = useState('');

  const setMainEscrow = async () => {
    const escrowService = new EscrowService(escrowAddressRaw);

    // Set escrow status
    const status = await escrowService.getStatus();
    setEscrowStatus(status);

    // Set escrow balance
    const escrowBalance = await escrowService.getBalance();
    setBalance(escrowBalance.toString());

    // Get manifest url
    const { url: manifestUrl } = await escrowService.getManifest();
    if (manifestUrl) {
      const manifestContent = (await axios.get(manifestUrl)).data;
      setRecordingOracleUrl(manifestContent.recording_oracle_url);
    }
  };

  const sendFortune = async () => {
    const payload = {
      workerAddress: address,
      escrowAddress: escrowAddressRaw,
      fortune: fortune
    };
    try {
      await axios.post(recordingOracleUrl, payload);
      alert('Your fortune has been submitted');
    } catch (err) {
      alert(err.response.data.message);
    }
    setFortune('');
  };

  return (
    <div className='escrow-container'>
      <div className='escrow-view'>
        <div>
          <input
            onChange={(e) => setEscrowAddressRaw(e.target.value)}
            value={escrowAddressRaw}
          />
          <button onClick={() => setMainEscrow()}> Confirm </button>
        </div>
        <span>
          Fill the exchange address to pass the fortune to the recording oracle
        </span>
        <span>
          <b>Address: </b> {escrowAddressRaw}
        </span>
        <span>
          <b>Status: </b> {escrowStatus}
        </span>
        <span>
          <b>Balance: </b> {balance}
        </span>
        <div>
          <input onChange={(e) => setFortune(e.target.value)} />
          <button onClick={sendFortune}> Send Fortune </button>
        </div>
      </div>
    </div>
  );
};
