import {
    Connection,
    Keypair,
    PublicKey,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage,
    AddressLookupTableProgram,
} from '@solana/web3.js';

import { createTransferInstruction } from '@solana/spl-token';
import { TokenProgramService, SolanaService } from '@coin98/solana-support-library';


export async function sendTransactionV0(
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: Keypair,
): Promise<void> {

    let blockhash = await connection
        .getLatestBlockhash('confirmed')
        .then((res) => res.blockhash);
    
    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message();
    
    const tx = new VersionedTransaction(messageV0);
    tx.sign([payer]);
    const sx = await connection.sendTransaction(tx);

    console.log(`** -- Signature: ${sx}`);
}

export async function extendLookupTable(
    addresses: PublicKey[],
    authority: PublicKey,
    lookupTable: PublicKey,
    payer: Keypair,
    connection: Connection
  ): Promise<void> {
    if(addresses.length < 1) {
        console.log("Lookup table is empty")
    }
    for (let i=0; i<addresses.length/30; i++) {
      const adds = [...addresses].splice(i*30,(i+1)*30)

      const extendInst = AddressLookupTableProgram.extendLookupTable({
        addresses: adds,
        authority:authority,
        payer: payer.publicKey,
        lookupTable: lookupTable,
      });
      await sendTransactionV0(connection, [extendInst], payer)

    }
   
  }


export async function sendTransactionV0WithLookupTable(
    connection: Connection,
    instructions: TransactionInstruction[],
    payer: Keypair,
    lookupTablePubkey: PublicKey,
): Promise<void> {

    const lookupTableAccount = await connection
        .getAddressLookupTable(lookupTablePubkey)
        .then((res) => res.value);

    let blockhash = await connection
        .getLatestBlockhash()
        .then((res) => res.blockhash);
    
    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions,
    }).compileToV0Message([lookupTableAccount]);
    
    const tx = new VersionedTransaction(messageV0);
    tx.sign([payer]);
    const sx = await connection.sendTransaction(tx);
    
    console.log(`** -- Signature: ${sx}`);
}

export async function findOrCreateAtas(
    mint: PublicKey,
    accounts: PublicKey[],
    connection: Connection,
    payer: Keypair
): Promise<PublicKey[]> {
    const atas: PublicKey[] = [];
    for(let i = 0; i < accounts.length; i++){
        const ata = TokenProgramService.findAssociatedTokenAddress(
            accounts[i],
            mint
        )
        if(SolanaService.isAddressInUse(connection,ata)) {
            await TokenProgramService.createAssociatedTokenAccount(
                connection,
                payer,
                accounts[i],
                mint
            )
        }
        atas.push(ata)
    }
    return atas;
}


export async function createArrTransferInstruction(
    mint: PublicKey,
    accounts: PublicKey[],
    amount: number,
    payer: PublicKey,
): Promise<TransactionInstruction[]> {
    const sourceAta = TokenProgramService.findAssociatedTokenAddress(
        payer,
        mint
    )
    console.log("source ata",sourceAta)
    const instructions: TransactionInstruction[] = [];
    for(let i = 0; i < accounts.length; i++){
        const tokenInst = createTransferInstruction(
            sourceAta,
            accounts[i],
            mint,
            amount
        )
        instructions.push(tokenInst)
    }
    return instructions;
}


export async function printAddressLookupTable(
    connection: Connection,
    lookupTablePubkey: PublicKey,
): Promise<void> {

    await delay(2);
    const lookupTableAccount = await connection
        .getAddressLookupTable(lookupTablePubkey)
        .then((res) => res.value);
    console.log(`Lookup Table: ${lookupTablePubkey}`);
    for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
        const address = lookupTableAccount.state.addresses[i];
        console.log(`   Index: ${i}  Address: ${address.toBase58()}`);
    }
}


export async function printBalances(
    connection: Connection,
    timeframe: string,
    pubkeyOne: PublicKey,
    pubkeyTwo: PublicKey,
): Promise<void> {

    console.log(`${timeframe}:`);
    console.log(`   Test Account #1 balance : ${
        await connection.getBalance(pubkeyOne)
    }`);
    console.log(`   Test Account #2 balance : ${
        await connection.getBalance(pubkeyTwo)
    }`);
}


export function delay(s: number) {
    return new Promise( resolve => setTimeout(resolve, s * 1000) );
}