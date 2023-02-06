# Solana Transaction V0 & Address Lookup Table

Solana Transaction v0: Solana is a high-performance blockchain platform that enables the development and deployment of decentralized applications. A transaction in Solana is a record of a transfer of value or data from one address to another on the Solana network. The Solana Transaction v0 is the first version of Solana transactions and the most basic form of transaction in the Solana blockchain.

Address Lookup Table: The address lookup table (ALT) is a data structure in Solana that allows for efficient mapping of public keys to account addresses. It is used to reduce the size of transaction data, enabling more efficient storage and transmission of information on the Solana network. By using the ALT, nodes on the Solana network can quickly look up the address of an account based on its public key, which is necessary for processing transactions. The ALT is a key component of the Solana blockchain, contributing to its high performance and scalability.



## Development

### Environment Setup

1. Install the latest [Solana tools](https://docs.solana.com/cli/install-solana-cli-tools).
2. Install the latest [Rust stable](https://rustup.rs/). If you already have Rust, run `rustup update` to get the latest version.

### Install dependencies

```bash
$ git clone https://github.com/PhNamVu/multi-send.git #<-- Clone the repo 

$ cd multi-send #<-- Change directory to the repo

$ npm install #<-- Install dependencies
```

### Build

### Build clients

```bash
# To build all clients
$ cargo build

# After build all clients, you can get the contract program id by:
$ solana address -k target/deploy/multi_send-keypair.json
# then copy that program id and replace the old one "48q3G4p5qwXNuDoLmdiZxUyTZ1nqfwNwM4QFRzDFjqAd" to your program id that you just got in the above command.
```

### Test
Start a local rpc to test the program:
```bash
$ solana-test-validator --no-bpf-jit --reset
```

Deploy the program to the local rpc:
```bash
$ cargo deploy
```

Unit tests contained within all projects can be run with:
```bash
$ npm run test
```

