import { sendTransactions } from '@elrondnetwork/dapp-core/services';
import { refreshAccount } from '@elrondnetwork/dapp-core/utils';
import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import {
  AbiRegistry,
  Address,
  AddressValue,
  ContractFunction,
  ResultsParser,
  SmartContract,
  SmartContractAbi,
  TypedValue
} from '@elrondnetwork/erdjs/out';
import escrowFactoryAbi from 'abi/job-factory.abi.json';
import { proxyNetwork, contractAddress, gasLimit } from 'config';

const abiRegistry = AbiRegistry.create(escrowFactoryAbi);
const abi = new SmartContractAbi(abiRegistry);

export default class EscrowFactory {
  contract: SmartContract;
  proxyProvider: ProxyNetworkProvider;

  constructor() {
    const scAddress = new Address(contractAddress);
    this.contract = new SmartContract({
      address: scAddress,
      abi
    });
    this.proxyProvider = new ProxyNetworkProvider(proxyNetwork);
  }

  async createJob(trusted_handler: Address) {
    const txArgs: TypedValue[] = [];
    txArgs.push(new AddressValue(trusted_handler));
    const networkConfig = await this.proxyProvider.getNetworkConfig();
    const tx = this.contract.call({
      func: new ContractFunction('createJob'),
      args: txArgs,
      gasLimit: gasLimit,
      chainID: networkConfig.ChainID
    });

    await refreshAccount();

    const { sessionId, error } = await sendTransactions({
      transactions: tx,
      transactionsDisplayInfo: {
        processingMessage: 'Creating new escrow contract',
        errorMessage: 'An error has occurred during escrow creation',
        successMessage: 'New escrow created!'
      },
      redirectAfterSign: false,
      minGasLimit: networkConfig.MinGasLimit
    });

    return { success: error !== undefined, error: error ?? '', sessionId };
  }

  async getTxOutcome(txHash: string) {
    const resultsParser = new ResultsParser();
    const transactionOnNetwork = await this.proxyProvider.getTransaction(
      txHash
    );

    return resultsParser.parseOutcome(
      transactionOnNetwork,
      this.contract.getEndpoint('createJob')
    );
  }
}
