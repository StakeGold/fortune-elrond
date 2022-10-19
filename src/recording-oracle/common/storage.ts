
interface StorageDict {
  [Key: string]: EscrowStorageResults
}

interface EscrowStorageResults {
  [Key: string]: string
}

type WorkerFortune = {
  address: string,
  fortune: string
}


class OracleStorage {
  protected storage: StorageDict

  constructor() {
    this.storage = {};
  }

  addEscrow(address: string): EscrowStorageResults {
    this.storage[address] = {};

    return this.getEscrow(address);
  }

  addFortune(escrowAddress: string, workerAddress: string, fortune_value: string) {
    this.storage[escrowAddress][workerAddress] = fortune_value;
  }

  getEscrow(address: string): EscrowStorageResults {
    return this.storage[address];
  }

  getWorkerResult(escrowAddress: string, workerAddress: string): string {
    return this.storage[escrowAddress][workerAddress];
  }

  getFortunes(escrowAddress: string): WorkerFortune[] {
    let escrowStorage: EscrowStorageResults = this.getEscrow(escrowAddress);
    let results: WorkerFortune[] = [];

    if(!escrowStorage) {
      return results;
    }

    for (let workerAddress of Object.keys(escrowStorage)) {
      let item: WorkerFortune = {
        address: workerAddress,
        fortune: escrowStorage[workerAddress]
      };
      results.push(item)
    }

    return results;
  }

  clearEscrow(escrowAddress: string) {
    this.storage[escrowAddress] = {};
  }

}

export const internalStorage = new OracleStorage();
