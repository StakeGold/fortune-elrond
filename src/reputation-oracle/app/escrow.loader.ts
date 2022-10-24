import { AbiRegistry } from '@elrondnetwork/erdjs/out';
import { promises } from 'fs';

export type AbiMetadata = {
  registry: AbiRegistry,
  name: string
};

export async function loadEscrowAbi(): Promise<AbiMetadata> {
  const jsonContent: string = await promises.readFile('abi/job.abi.json', { encoding: 'utf8'});
  const json = JSON.parse(jsonContent);

  return {
    registry: AbiRegistry.create(json),
    name: json.name
  };
}