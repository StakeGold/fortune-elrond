import React, { useState } from 'react';
import {
  useGetAccountInfo,
  useTrackTransactionStatus
} from '@elrondnetwork/dapp-core/hooks';
import { Address } from '@elrondnetwork/erdjs/out';
import { contractAddress } from '../../../config';
import EscrowFactory from '../escrow-factory.service';

export const Create = () => {
  const { address } = useGetAccountInfo();
  const escrowFactory = new EscrowFactory();
  const [escrow, setEscrow] = useState('');
  const [lastEscrow, setLastEscrow] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createEscrow = async () => {
    const response = await escrowFactory.createJob(new Address(address));
    setSessionId(response.sessionId);
  };

  const handleSuccessCreation = async () => {
    const transactions = transactionStatus.transactions;
    if (transactions !== undefined) {
      const lastTxHash = transactions[0].hash;
      const resp = await escrowFactory.getTxOutcome(lastTxHash);
      setLastEscrow(resp.firstValue?.valueOf().toString());
      setEscrow(resp.firstValue?.valueOf().toString());
    }
    setSessionId(null);
  };

  const handleFailureCreation = () => {
    setSessionId(null);
  };

  const transactionStatus = useTrackTransactionStatus({
    transactionId: sessionId,
    onSuccess: handleSuccessCreation,
    onFail: handleFailureCreation,
    onCancelled: handleFailureCreation
  });

  return (
    <div className='escrow-create'>
      <span>
        <b>Factory address:</b> {contractAddress}
      </span>
      <span>
        <b>Last escrow created:</b> {lastEscrow}
      </span>
      <span>
        <b>Escrow created:</b> {escrow}
      </span>
      <button onClick={createEscrow}> Create the Escrow </button>
    </div>
  );
};
