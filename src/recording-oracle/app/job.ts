import { Request, Response } from 'express';
import { EscrowService } from "./escrow.service";
import { Address } from "@elrondnetwork/erdjs/out";
import { hasStatus, hasValidFortunes, isValidAddress} from "../common/validators";
import { EscrowStatus } from "../common/mapper";
import { loadEscrowAbi } from "./escrow.loader";
import axios from "axios";
import {internalStorage} from "../common/storage";


export async function recordResults(req: Request, res: Response): Promise<Response> {

  const { workerAddress, escrowAddress, fortune } = req.body;

  if(!isValidAddress(escrowAddress)) {
    return res.status(400).send({
      field: 'workerAddress',
      message: 'Valid ethereum address required'
    })
  }

  if(!hasValidFortunes(fortune)) {
    return res.status(400).send({
      field: 'fortune',
      message: 'Non-empty fortunes is required'
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

  if(await hasStatus(escrowContract, EscrowStatus.Pending)) {
    return res.status(400).send({
      field: 'escrowAddress',
      message: 'The Escrow is not in the Pending status'
    });
  }

  let manifestResponse;
  try{
    const manifestUrl = await escrowContract.getManifest();
    manifestResponse = await axios.get(manifestUrl.url);
  } catch (err) {
    return res.status(500).send({
      message: 'Could not fetch manifest',
      err: err
    });
  }

  let { fortunes_requested: fortuneRequested, reputation_oracle_url: reputationOracleUrl } = manifestResponse.data;
  if(!internalStorage.getEscrow(escrowAddress)) {
    internalStorage.addEscrow(escrowAddress);
  }
  if(internalStorage.getWorkerResult(escrowAddress, workerAddress)) {
    return res.status(400).send({
      message: `${workerAddress} already submitted a fortune`
    });
  }
  internalStorage.addFortune(escrowAddress, workerAddress, fortune);
  let fortunes = internalStorage.getFortunes(escrowAddress);

  if (fortunes.length === fortuneRequested) {
    console.log('Doing bulk payouts');
    // a cron job might check how much annotations are in work
    // if this is full - then just push them to the reputation oracle

    await axios.post(reputationOracleUrl, { escrowAddress, fortunes });
    internalStorage.clearEscrow(escrowAddress);
  }

  return res.status(201).send();
}
