import { sendTransactions } from '@elrondnetwork/dapp-core/services';
import { refreshAccount } from '@elrondnetwork/dapp-core/utils';
import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import {
  AbiRegistry,
  Address,
  Interaction,
  ResultsParser,
  SmartContract,
  SmartContractAbi,
  TokenPayment,
  Transaction,
  TypedOutcomeBundle
} from '@elrondnetwork/erdjs/out';
import BigNumber from 'bignumber.js';
import escrowAbi from 'abi/job.abi.json';
import { gasLimit, HMT_DECIMALS, HMT_TOKEN, proxyNetwork } from '../../config';

const abiRegistry = AbiRegistry.create(escrowAbi);
const abi = new SmartContractAbi(abiRegistry);
const networkProxy: string =
  proxyNetwork || 'https://devnet-gateway.elrond.com';

type UrlHashPair = {
  url: string;
  hash: string;
};

type SetupPayload = {
  reputation_oracle: Address;
  recording_oracle: Address;
  reputation_oracle_stake: BigNumber;
  recording_oracle_stake: BigNumber;
  url: string;
  hash: string;
};

export class EscrowService {
  contract: SmartContract;
  networkProvider: ProxyNetworkProvider;

  constructor(address: string) {
    const contractAdress = new Address(address);
    this.contract = new SmartContract({
      address: contractAdress,
      abi
    });
    this.networkProvider = new ProxyNetworkProvider(networkProxy);
  }

  async getStatus(): Promise<string> {
    const interaction = <Interaction>this.contract.methods.getStatus();
    try {
      const { firstValue } = await this.performQuery(interaction);

      return firstValue?.valueOf()?.name;
    } catch (err) {
      return '';
    }
  }

  async getBalance(): Promise<number> {
    const interaction = <Interaction>this.contract.methods.getBalance();
    const response = await this.performQuery(interaction);
    const firstValue = response.firstValue?.valueOf();

    return parseInt(firstValue);
  }

  async getManifest(): Promise<UrlHashPair> {
    const interaction = <Interaction>this.contract.methods.getManifest();
    const { firstValue } = await this.performQuery(interaction);

    return {
      url: firstValue?.valueOf()?.url.toString(),
      hash: firstValue?.valueOf()?.hash.toString()
    };
  }

  async getFinalResults(): Promise<UrlHashPair> {
    const interaction = <Interaction>this.contract.methods.getFinalResults();
    const { firstValue } = await this.performQuery(interaction);

    return {
      url: firstValue?.valueOf()?.fields[0].name,
      hash: firstValue?.valueOf()?.fields[1].name
    };
  }

  async getOracles(): Promise<any> {
    const interaction = <Interaction>this.contract.methods.getOracles();
    const { firstValue } = await this.performQuery(interaction);

    return firstValue?.valueOf();
  }

  async fundEscrow(amount: number): Promise<{
    success: boolean;
    error: string;
    sessionId: string | null;
  }> {
    const networkConfig = await this.networkProvider.getNetworkConfig();
    const tx = this.contract.methods
      .deposit([])
      .withSingleESDTTransfer(
        TokenPayment.fungibleFromAmount(
          HMT_TOKEN,
          new BigNumber(amount),
          HMT_DECIMALS
        )
      )
      .withGasLimit(gasLimit)
      .withChainID(networkConfig.ChainID)
      .buildTransaction();

    const txDisplay = {
      processingMessage: 'Funding escrow',
      errorMessage: 'Funding error',
      successMessage: 'Escrow funded'
    };

    return await this.performCall(tx, txDisplay);
  }

  async setupEscrow(data: SetupPayload): Promise<{
    success: boolean;
    error: string;
    sessionId: string | null;
  }> {
    const networkConfig = await this.networkProvider.getNetworkConfig();
    const tx = this.contract.methods
      .setup([
        data.recording_oracle,
        data.reputation_oracle,
        data.recording_oracle_stake,
        data.reputation_oracle_stake,
        data.url,
        data.hash
      ])
      .withGasLimit(gasLimit)
      .withChainID(networkConfig.ChainID)
      .buildTransaction();

    const txDisplay = {
      processingMessage: 'Setup escrow',
      errorMessage: 'Setup error',
      successMessage: 'Escrow setup complete'
    };

    return await this.performCall(tx, txDisplay);
  }

  private async performCall(
    tx: Transaction,
    txDisplay: object
  ): Promise<{
    success: boolean;
    error: string;
    sessionId: string | null;
  }> {
    await refreshAccount();
    const networkConfig = await this.networkProvider.getNetworkConfig();

    try {
      const { sessionId, error } = await sendTransactions({
        transactions: tx,
        transactionsDisplayInfo: txDisplay,
        redirectAfterSign: false,
        minGasLimit: networkConfig.MinGasLimit
      });

      return { success: error !== undefined, error: error ?? '', sessionId };
    } catch (error: any) {
      console.log(`Escrow Call Error: ${error}`);
      return { success: false, error: error.message, sessionId: null };
    }
  }

  private async performQuery(
    interaction: Interaction
  ): Promise<TypedOutcomeBundle> {
    const resultParser = new ResultsParser();
    const queryResponse = await this.networkProvider.queryContract(
      interaction.check().buildQuery()
    );

    return resultParser.parseQueryResponse(
      queryResponse,
      interaction.getEndpoint()
    );
  }
}
