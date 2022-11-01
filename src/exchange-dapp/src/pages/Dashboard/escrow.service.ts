import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers/out';
import {
  AbiRegistry,
  Address,
  Interaction,
  ResultsParser,
  SmartContract,
  SmartContractAbi,
  TypedOutcomeBundle
} from '@elrondnetwork/erdjs/out';
import escrowAbi from 'abi/job.abi.json';
import { proxyNetwork } from '../../config';

const abiRegistry = AbiRegistry.create(escrowAbi);
const abi = new SmartContractAbi(abiRegistry);

type UrlHashPair = {
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
    this.networkProvider = new ProxyNetworkProvider(proxyNetwork);
  }

  async getStatus(): Promise<string> {
    const interaction = <Interaction>this.contract.methods.getStatus();
    try {
      const { firstValue } = await this.performQuery(interaction);

      return firstValue?.valueOf()?.name;
    } catch (err) {
      console.log('Error performing query -> getStatus');
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
      url: firstValue?.valueOf()?.fields[0].name,
      hash: firstValue?.valueOf()?.fields[1].name
    };
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
