import {
  AbiRegistry,
  Address, AddressValue, Field,
  Interaction,
  ResultsParser,
  SmartContract,
  SmartContractAbi, StringValue, Struct, Tuple, TupleType,
  TypedOutcomeBundle, U64Value, VariadicType, VariadicValue,
} from '@elrondnetwork/erdjs/out';
import { ProxyNetworkProvider } from '@elrondnetwork/erdjs-network-providers';
import { AbiMetadata } from "./escrow.loader";
import dotenv from 'dotenv';
import {Payment, UrlHashPair} from "../common/models";

dotenv.config();

const networkProxy: string = process.env.NETWORK_ENV || 'https://devnet-gateway.elrond.com';

export class EscrowService {
  contract: SmartContract
  registry: AbiRegistry
  networkProvider: ProxyNetworkProvider

  constructor(address: Address, abi_metadata: AbiMetadata) {
    this.contract = new SmartContract({
      address: address,
      abi: new SmartContractAbi(abi_metadata.registry, [abi_metadata.name])
    });
    this.registry = abi_metadata.registry;
    this.networkProvider = new ProxyNetworkProvider(networkProxy);
  }

  private toVariadicType(data: Array<Payment>): VariadicValue {
    let tupleType = new TupleType();
    let variadicType = new VariadicType(tupleType);
    let items: Tuple[] = [];
    for (let payment of data) {
      const [ workerAddress, reward ] = payment
      let tuple = new Tuple(tupleType, [
          new Field(new AddressValue(new Address(workerAddress))),
          new Field(new U64Value(reward))
      ]);

      items.push(tuple);
    }

    return new VariadicValue(variadicType, items);
  }

  async getBalance(): Promise<number>{
    let interaction = <Interaction>this.contract.methods.getBalance();
    let response = await this.performQuery(interaction);
    let firstValue = response.firstValue?.valueOf();

    return parseInt(firstValue)
  }

  async createBulkPayout(payments: Array<Payment>, finalResults: UrlHashPair): Promise<string> {
    let encodedPayments = this.toVariadicType(payments);
    let urlHashPairType = this.registry.getStruct('UrlHashPair');
    let interaction = <Interaction>this.contract.methods.bulkPayOut([
        encodedPayments,
        new Struct(urlHashPairType, [
          new Field(new StringValue(finalResults.url)),
          new Field(new StringValue(finalResults.hash))
        ])
    ])

    let tx = interaction
        .withGasLimit(200000000)
        .buildTransaction();

    return await this.networkProvider.sendTransaction(tx);
  }

  private async performQuery(interaction: Interaction): Promise<TypedOutcomeBundle> {
    let resultParser = new ResultsParser();
    let queryResponse = await this.networkProvider.queryContract(interaction.check().buildQuery());

    return resultParser.parseQueryResponse(queryResponse, interaction.getEndpoint())
  }
}

