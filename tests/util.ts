import {
    AccountMeta,
    Connection,
    Keypair,
    PublicKey,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage,
    AddressLookupTableProgram,
} from '@solana/web3.js';

import {
    TOKEN_PROGRAM_ID
  } from '@coin98/solana-support-library'
import colors from 'colors'
import { TokenProgramService, SolanaService } from '@coin98/solana-support-library';

import { BN, BorshCoder, Idl } from '@project-serum/anchor'

import  MultiSend  from '../target/idl/multi_send.json'

const coder = new BorshCoder(MultiSend as Idl) 


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

    console.log(colors.cyan('** -- Signature:'),sx);
}

export async function extendLookupTable(
    addresses: PublicKey[],
    authority: PublicKey,
    lookupTable: PublicKey,
    payer: Keypair,
    connection: Connection
  ): Promise<void> {
    if(addresses.length < 1) {
        console.log(colors.yellow("\n Lookup table is empty"))
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
    
    console.log(colors.green(`✅ Multi Send Signature:`), sx);
}

export async function findOrCreateAtas(
    mint: PublicKey,
    accounts: PublicKey[],
    connection: Connection,
    payer: Keypair
): Promise<PublicKey[]> {
    const atas: PublicKey[] = [];
    console.log(colors.magenta.italic(`\nFinding and creating Associated Token Accounts  \n`));

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
    amount: BN,
    payer: Keypair,
): Promise<TransactionInstruction> {
    let extraAccounts: AccountMeta[] = []

    const sourceAta = TokenProgramService.findAssociatedTokenAddress(
        payer.publicKey,
        mint
    )

    const data = coder.instruction.encode('multi_send', {
        amount,
        accounts,
    })

    for (let i = 0; i < accounts.length; i++) {
            extraAccounts.push(
                <AccountMeta>{ pubkey: accounts[i], isSigner: false, isWritable: true },
            )
       
    }

    const keys: AccountMeta[] = [
        <AccountMeta>{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        <AccountMeta>{ pubkey: sourceAta, isSigner: false, isWritable: true },
        <AccountMeta>{ pubkey: payer.publicKey, isSigner: true, isWritable: false },
        ...extraAccounts
    ]   
    return new TransactionInstruction({
        data,
        keys,
        programId: new PublicKey('48q3G4p5qwXNuDoLmdiZxUyTZ1nqfwNwM4QFRzDFjqAd'),
    })
   
}


export async function printAddressLookupTable(
    connection: Connection,
    lookupTablePubkey: PublicKey,
): Promise<void> {

    await delay(2);
    const lookupTableAccount = await connection
        .getAddressLookupTable(lookupTablePubkey)
        .then((res) => res.value);
    console.log(colors.cyan(`\nLookup Table Address:`), `${lookupTablePubkey} \n`);
    for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) {
        const address = lookupTableAccount.state.addresses[i];
        console.log('Index', colors.green(i.toString()), 'Address', colors.green(address.toBase58()));
    }
}

export function delay(s: number) {
    return new Promise( resolve => setTimeout(resolve, s * 1000) );
}