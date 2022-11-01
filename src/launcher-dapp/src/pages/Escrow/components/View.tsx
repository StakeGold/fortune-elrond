import React, { useState } from 'react';
import { Address } from '@elrondnetwork/erdjs/out';
import { BigNumber } from 'bignumber.js';
import { REC_ORACLE_ADDRESS, REP_ORACLE_ADDRESS } from '../../../config';
import { EscrowService } from '../escrow.service';

const Controls = (props: any) => {
  const [recOracleAddr, setRecOracleAddr] = useState(REC_ORACLE_ADDRESS);
  const [recOracleStake, setRecOracleStake] = useState(10);
  const [repOracleAddr, setRepOracleAddr] = useState(REP_ORACLE_ADDRESS);
  const [repOracleStake, setRepOracleStake] = useState(10);
  const [manifestUrl, setManifestUrl] = useState('');
  const [hmt, setHmt] = useState(0);
  const [, setSessionId] = useState<string | null>(null);
  const [, setErrorMessage] = useState('');
  const escrowContract = new EscrowService(props.escrowAddr);

  const fundEscrow = async () => {
    const response = await escrowContract.fundEscrow(hmt);
    setSessionId(response.sessionId);
    setErrorMessage(response.success ? '' : response.error);
  };

  const setupEscrow = async () => {
    const payload = {
      reputation_oracle: new Address(repOracleAddr),
      recording_oracle: new Address(recOracleAddr),
      reputation_oracle_stake: new BigNumber(repOracleStake),
      recording_oracle_stake: new BigNumber(recOracleStake),
      url: manifestUrl,
      hash: manifestUrl
    };
    const response = await escrowContract.setupEscrow(payload);
    setSessionId(response.sessionId);
    setErrorMessage(response.success ? '' : response.error);
  };

  return (
    <>
      <div>
        <p> Fund the escrow: </p>
        <input onChange={(e) => setHmt(parseInt(e.target.value))} />
        <button onClick={() => fundEscrow()}> Fund</button>
      </div>
      <div className='escrow-controls'>
        <div>
          Recording Oracle:
          <input
            onChange={(e) => setRecOracleAddr(e.target.value)}
            value={recOracleAddr}
          />
        </div>
        <div>
          Recording Oracle Stake:
          <input
            onChange={(e) => setRecOracleStake(parseInt(e.target.value))}
            value={recOracleStake}
          />
        </div>
        <div>
          Reputation Oracle:
          <input
            onChange={(e) => setRepOracleAddr(e.target.value)}
            value={repOracleAddr}
          />
        </div>
        <div>
          Reputation Oracle Stake:
          <input
            onChange={(e) => setRepOracleStake(parseInt(e.target.value))}
            value={repOracleStake}
          />
        </div>
        <div>
          <span> Manifest URL: </span>
          <input
            onChange={(e) => setManifestUrl(e.target.value)}
            value={manifestUrl}
          />
        </div>
        <div>
          <button onClick={() => setupEscrow()}> Setup Escrow</button>
        </div>
      </div>
    </>
  );
};

export const View = () => {
  const [escrow, setEscrow] = useState('');
  const [escrowStatus, setEscrowStatus] = useState('');
  const [reputationOracle, setReputationOracle] = useState('');
  const [reputationOracleStake, setReputationOracleStake] = useState('');
  const [recordingOracle, setRecordingOracle] = useState('');
  const [recordingOracleStake, setRecordingOracleStake] = useState('');
  const [manifestUrl, setManifestUrl] = useState('');
  const [finalResultsUrl, setFinalResultsUrl] = useState('');
  const [balance, setBalance] = useState('');
  const [exchangeUrl, setExchangeUrl] = useState('');

  const setMainEscrow = async () => {
    const escrowContract = new EscrowService(escrow);
    const status = await escrowContract.getStatus();
    setEscrowStatus(status);

    const balance = await escrowContract.getBalance();
    setBalance(balance.toString());

    const manifest = await escrowContract.getManifest();
    setManifestUrl(manifest.url);
    console.log('here');

    const finalResults = await escrowContract.getFinalResults();
    setFinalResultsUrl(finalResults.url);
  };

  return (
    <div className='escrow-view'>
      <div className='escrow-view-select-escrow'>
        <input onChange={(e) => setEscrow(e.target.value)} value={escrow} />
        <button onClick={() => setMainEscrow()} disabled={!escrow}>
          {' '}
          Search Escrow{' '}
        </button>
      </div>
      <span>
        Paste either the address from the Escrow created field or a new one
      </span>
      <span>
        <b>Address: </b> {escrow}{' '}
      </span>
      <span>
        <b>Status: </b> {escrowStatus}
      </span>
      <span>
        <b>Balance: </b> {balance}
      </span>
      <span>
        <b>Recording Oracle: </b> {recordingOracle}
      </span>
      <span>
        <b>Recording Oracle Stake: </b> {recordingOracleStake}%
      </span>
      <span>
        <b>Reputation Oracle: </b> {reputationOracle}
      </span>
      <span>
        <b>Reputation Oracle Stake: </b> {reputationOracleStake}%
      </span>
      {exchangeUrl && (
        <span>
          <a href={exchangeUrl} rel='noreferrer noopener' target='_blank'>
            Exchange
          </a>
        </span>
      )}
      <span>
        {!manifestUrl && <b> Manifest </b>}
        {manifestUrl && (
          <a href={manifestUrl} rel='noreferrer noopener' target='_blank'>
            Manifest URL
          </a>
        )}
      </span>
      <span>
        {!finalResultsUrl && <b> Final Results </b>}
        {finalResultsUrl && (
          <a href={finalResultsUrl} rel='noreferrer noopener' target='_blank'>
            Final Results
          </a>
        )}
      </span>
      {escrowStatus === 'Launched' && <Controls escrowAddr={escrow} />}
    </div>
  );
};
