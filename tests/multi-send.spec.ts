import { TokenProgramService } from '@coin98/solana-support-library';
import {
  SolanaConfigService,

} from '@coin98/solana-support-library/config';
import * as anchor from "@project-serum/anchor";
import { Program } from '@project-serum/anchor';

 

import {

  Connection, Keypair
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { MultiSend } from "../target/types/multi_send";

describe("multi-send", () => {
  // Configure the client to use the local cluster.
  // anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.TokenContract as Program<MultiSend>;
  const connection = new Connection('http://localhost:8899', 'confirmed')
  let defaultAccount: Keypair;

    // Generate a random keypair that will represent our token
    const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  

  before(async () => {
    defaultAccount = await SolanaConfigService.getDefaultAccount()
  });
 
  it("Mint token!", async () => {
      
    

    const tokenMint = await TokenProgramService.createTokenMint(
      connection,
      defaultAccount,
      mintKey,
      8,
      defaultAccount.publicKey,
      defaultAccount.publicKey
    )
  
    const mintToken = await TokenProgramService.mint(
      connection,
      defaultAccount,
      mintKey.publicKey,
      defaultAccount.publicKey,
      new BN(100e8)
    )

    console.log("tokenMint:",tokenMint)
    console.log("mintToken:",mintToken)
  
    
  });

  // it("Single send", async () => {
    

  //   // Wallet that will receive the token 
  //   const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  //    // The ATA for a token on the to wallet (but might not exist yet)
  //   const transferToken = await TokenProgramService.transfer(
  //     connection,
  //     defaultAccount,
  //     mintKey.publicKey,
  //     toWallet.publicKey,
  //     new BN(10e8)
  //   )

  //   console.log("transferToken", transferToken)

      
  // })
    
});
