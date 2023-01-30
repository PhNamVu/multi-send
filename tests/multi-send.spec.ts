import { sendTransaction, sendTransaction2, TokenProgramService } from '@coin98/solana-support-library';
import {
  SolanaConfigService, TestAccountService,

} from '@coin98/solana-support-library/config';

import { createTransferInstruction } from '@solana/spl-token';
 

import {

  TransactionMessage, Connection, Keypair, AddressLookupTableProgram, Transaction, PublicKey

} from '@solana/web3.js';
import { BN } from 'bn.js';
import { printAddressLookupTable, sendTransactionV0 } from './util';

describe("multi-send", () => {
  // Configure the client to use the local cluster.
  // anchor.setProvider(anchor.AnchorProvider.env());
  const connection = new Connection('http://localhost:8899', 'confirmed')
  let defaultAccount: Keypair;
  let testAccount1: Keypair
  let testAccount2: Keypair

  // Generate a random keypair that will represent our token
  const mintKey  = Keypair.generate();

   
  
  before(async () => {
    defaultAccount = await SolanaConfigService.getDefaultAccount()
    testAccount1 = await TestAccountService.getAccount(0)
    testAccount2 = await TestAccountService.getAccount(1)
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

  it("Create and extend Address Lookup Table", async () => {
   
    const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: defaultAccount.publicKey,
      payer: defaultAccount.publicKey,
      recentSlot: await connection.getSlot('finalized')

    })

      

    const extendInst =  AddressLookupTableProgram.extendLookupTable({
      addresses: [testAccount1.publicKey, testAccount2.publicKey],
      authority: defaultAccount.publicKey,
      lookupTable: lookupTableAddress,
      payer: defaultAccount.publicKey
    })

    
    const tx = new Transaction()
    tx.add(lookupTableInst, extendInst)
    const sx = await sendTransaction(connection , tx, [defaultAccount])
    await printAddressLookupTable(connection, lookupTableAddress);

    console.log(sx)
    

  })

  // it()

  
});

 
0