import { Address } from '@elrondnetwork/erdjs/out';
import {Fortunes, WorkerFortune} from "./models";

export function hasValidFortunes(fortunes: any) {
  return Array.isArray(fortunes) || fortunes.length > 0
}

export function isValidAddress(address: string): boolean {
  try{
    new Address(address)
  } catch(err) {
    return false;
  }

  return true;
}

export function filterFortunes(fortunes: Fortunes): Array<WorkerFortune> {
  const filteredResults = [];
  const tmpHashMap: { [Key: string]: boolean } = {};

  for (let fortuneEntry of fortunes) {
    const { fortune } = fortuneEntry;
    if (tmpHashMap[fortune]) {
      continue;
    }

    tmpHashMap[fortune] = true;
    filteredResults.push(fortuneEntry);
  }

  return filteredResults;
}

export function calculateRewardForWorker(totalReward: number, numberOfWorkers: number): number {
  return Math.floor(totalReward / numberOfWorkers);
}
