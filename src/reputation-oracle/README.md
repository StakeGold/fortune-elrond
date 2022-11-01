# Reputation Oracle

An Elrond Network Oracle which pays workers for the jobs performed, based on their reputation within the oracle network. In this case, the Reputation Oracle collects all the responses from the Recording Oracle and pays out the Worker and the Recording Oracle.

## Escrow contract service

The escrow service serves as the middleman for communicating with the escrow contracts deployed on the Elrond Network.

Queries:
- `getBalance` - Fetch the balance of the escrow contract

Calls:
- `createBulkPayout` - Performs the payout for all the workers

## Endpoints

- `POST /jobs/results/` - Main entrypoint were the oracle will collect all the responses and do bulk payouts.