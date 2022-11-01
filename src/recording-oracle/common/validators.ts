import {Address} from "@elrondnetwork/erdjs/out";
import {EscrowService} from "../app/escrow.service";
import {EscrowStatus} from "./mapper";

export function isValidAddress(address: string): boolean {
  try{
    new Address(address)
  } catch(err) {
    return false;
  }

  return true;
}

export function hasValidFortunes(fortunes: any[]) {
  try {
    return fortunes.length > 0
  } catch (err: any) {
    console.log('No fortunes given')
    return false
  }
}

export async function hasStatus(contract: EscrowService, required_status: EscrowStatus): Promise<boolean> {
  let escrowStatus = await contract.getStatus();

  return required_status !== escrowStatus
}