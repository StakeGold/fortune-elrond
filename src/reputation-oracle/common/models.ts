export type WorkerFortune = {
  address: string,
  fortune: string
};

export type Fortunes = Array<WorkerFortune>;

export type Payment = [string, string];

export type UrlHashPair = {
  url: string,
  hash: string
}
