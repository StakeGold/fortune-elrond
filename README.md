# Fortune

Welcome to Fortune, an example HUMAN application that demonstrates how to create and fulfill job requests using the HUMAN protocol.

> **Warning**
> For running Fortune with docker-compose you need at least version 1.27.0. Check with command `docker-compose --version`

## How it works

In this specific usecase a job requester is requesting a fortune prediction from a group of workers (Fortune Tellers). Each Fortune Teller will provide their answers, which will then be verified and settled by a group of Oracles.

## High Level Overview

At a very high level this project consists of 4 main components (smart contracts):

**Launcher (Job Launcher)** - The Job Launcher is factory which creates new escrow contracts. A job requester can then add Job details (as a mainfest) and fund the escrow.

**Exchange Oracle** - An Ethereum Oracle that interacts with people or bots to fufill the job.

**Recording Oracle** - An Ethereum Oracle which records the task output and who does what. In this case, the Recording Oracle will receive responses from the Exchange Oracle.

**Reptutation Oracle** - An Ethereum Oracle which pays workers for the jobs performed, based on their reputation within the oracle network. In this case, the Reputation Oracle collects all the responses from the Recording Oracle and pays out the Worker and the Recording Oracle.

### User Persona's in this demo

**Job Creator/Requester** - The entity/person who wants some work performed.

**Worker (Fortune Teller)** - The entity/person who performs the actual work.

## Process Flow

### Job Submission and Routing

1. The Job creator creates an escrow, funds it and adds the job manifest (a url with the job details)
2. Once the job is registered on-chain the Exchange Oracle picks up the job and routes it to workers.

![Diagram for steps 1 and 2](assets/fortuneflow1.jpg)

### Job Fulfillment and Answer Quality

3. Workers perform the task and submit their responses (answers) back to the Exchange Oracle.
4. The Exchange Oracle passes the responses to the Recording Oracle, which then checks the quality of answers. If the quality is acceptable the answers are then routed to the Reputation Oracle.

![Diagram for steps 3 and 4](assets/fortuneflow2.jpg)

### Settlement

5. The Reputation Oracle calculates a threshold based on certain job request parameters. If the answers pass the threshold it pays workers and updates the reputation scores for each worker.

![Diagram for steps 4 and 5](assets/fortuneflow3.jpg)

## Usage Instructions

There are two options to run the example, use our deployed playground example or run the example locally using Docker.

# Conclusion

In this example we have demonstrated the steps involved in creating and fulfilling jobs on the HUMAN protocol. This is a very basic example which could easily be extended to other use case's. If you have any problems with the setup or usage of this example, please open an issue and let us know! Feel free to check out the HUMAN github repostory for other useful resources.