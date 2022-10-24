import { Request, Response } from 'express';
import { filterFortunes, hasValidFortunes, isValidAddress, calculateRewardForWorker } from '../common/helpers';
import { EscrowService } from './escrow.service';
import { loadEscrowAbi } from './escrow.loader';
import { Address } from '@elrondnetwork/erdjs/out';
import { Fortunes, Payment } from "../common/models";
import { uploadResults } from "./s3";


export async function fetchJobResults(req: Request, res: Response) {

  const { fortunes, escrowAddress }: { fortunes: Fortunes, escrowAddress: string } = req.body;

  if(!hasValidFortunes(fortunes)) {
    return res.status(400).json({
      field: 'fortunes',
      message: 'Fortunes are not specified or empty'
    });
  }

  if(!isValidAddress(escrowAddress)) {
    return res.status(400).json({
      field: 'escrowAddress',
      message: 'Escrow address is empty of invalid'
    });
  }

  let escrowContract: EscrowService;
  try{
    let abi_metadata = await loadEscrowAbi();
    escrowContract = new EscrowService(new Address(escrowAddress), abi_metadata);
  } catch (err) {
    return res.send(500).json({
      message: 'Could not load escrow contract',
      err: err
    });
  }

  let balance = await escrowContract.getBalance();
  let filteredFortunes = filterFortunes(fortunes);
  let evenWorkerReward = calculateRewardForWorker(balance, filteredFortunes.length);
  let resultsUrl = await uploadResults(fortunes.map(({fortune}) => fortune), escrowAddress);
  let workerAddresses = filteredFortunes.map(fortune => fortune.address);

  const payments: Array<Payment> = [];
  for (let worker of workerAddresses) {
    payments.push([worker, evenWorkerReward.toString()])
  }

  await escrowContract.createBulkPayout(payments, resultsUrl);

  console.log(`-> Payments: ${payments}`);

  res.status(201).send({
    message: 'Escrow has been completed'
  });
}
