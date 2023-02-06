import { TokenProgramService } from '@coin98/solana-support-library';
import {
  SolanaConfigService, 

} from '@coin98/solana-support-library/config';

import {

   Connection, Keypair, AddressLookupTableProgram, PublicKey

} from '@solana/web3.js';
import { printAddressLookupTable, 
  sendTransactionV0, 
  extendLookupTable, delay, findOrCreateAtas, sendTransactionV0WithLookupTable, createArrTransferInstruction } from './util';

  import { BN } from 'bn.js';



describe("multi-send", () => {
  const connection = new Connection('http://localhost:8899', 'confirmed')
  let defaultAccount: Keypair;


  // Generate a random keypair that will represent our token
  const mintKey  = Keypair.generate();
  let accounts: PublicKey[] = [];

   
  
  before(async () => {
    defaultAccount = await SolanaConfigService.getDefaultAccount()
    for(let i = 0; i < 25; i++){
      accounts.push(Keypair.generate().publicKey)
    }
  });
 
  it("Mint token!", async () => {
      
    

   await TokenProgramService.createTokenMint(
      connection,
      defaultAccount,
      mintKey,
      8,
      defaultAccount.publicKey,
      defaultAccount.publicKey
    )
  
   await TokenProgramService.mint(
      connection,
      defaultAccount,
      mintKey.publicKey,
      defaultAccount.publicKey,
      new BN(200000000000)
   )  
  });

  
  it("Create, extend and multi send using Address Lookup Table", async () => {
   
    const [lookupTableInst, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
      authority: defaultAccount.publicKey,
      payer: defaultAccount.publicKey,
      recentSlot: await connection.getSlot('finalized')
    })   

    
    
    await sendTransactionV0(connection, [lookupTableInst], defaultAccount)
    await delay(1)
    await extendLookupTable([...accounts], defaultAccount.publicKey, lookupTableAddress, defaultAccount, connection)
    await printAddressLookupTable(connection, lookupTableAddress);

    const ATAs = await findOrCreateAtas(
      mintKey.publicKey,
      accounts,
      connection,
      defaultAccount
    )

    const tokenInst = await createArrTransferInstruction(
      mintKey.publicKey,
      ATAs,
      new BN('100000000'),
      defaultAccount
    )
    // await sendTransactionV0(connection, [tokenInst], defaultAccount)
    
    // BUG here
    await sendTransactionV0WithLookupTable(connection, [tokenInst], defaultAccount, lookupTableAddress)

  })

  
 
  
});

 
0