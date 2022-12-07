import {
  Address,
  Interaction,
  ResultsParser,
  SmartContract,
  SmartContractAbi,
  TypedOutcomeBundle, TypedValue,
} from "@elrondnetwork/erdjs/out";
import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers';
import dotenv from "dotenv";
import { AbiMetadata } from "./escrow.loader";
dotenv.config();

const networkProxy: string = process.env.NETWORK_ENV || "https://devnet-gateway.elrond.com";

type UrlHashPair = {
  url: string,
  hash: string
}

export class EscrowService {
  contract: SmartContract
  networkProvider: ProxyNetworkProvider

  constructor(address: Address, abi_metadata: AbiMetadata) {
    this.contract = new SmartContract({
      address: address,
      abi: new SmartContractAbi(abi_metadata.registry, [abi_metadata.name])
    })
    this.networkProvider = new ProxyNetworkProvider(networkProxy);
  }

  async getStatus(): Promise<string>{
    let interaction = <Interaction>this.contract.methods.getStatus();
    try{
      let { firstValue } = await this.performQuery(interaction);

      // @ts-ignore
      return firstValue.name
    } catch (err) {
      console.log("Error performing query -> getStatus")
      return ''
    }
  }

  async getManifest(): Promise<UrlHashPair> {
    let interaction = <Interaction>this.contract.methods.getManifest();
    let { firstValue } = await this.performQuery(interaction);

    return {
      url: firstValue?.valueOf().url.toString(),
      hash: firstValue?.valueOf().hash.toString()
    };
  }


  private async performQuery(interaction: Interaction): Promise<TypedOutcomeBundle> {
    let resultParser = new ResultsParser();
    let queryResponse = await this.networkProvider.queryContract(interaction.check().buildQuery());

    return resultParser.parseQueryResponse(queryResponse, interaction.getEndpoint())
  }
}

