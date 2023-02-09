import {
  TokenProgramService,
  SystemProgramService,
} from "@coin98/solana-support-library";
import { SolanaConfigService } from "@coin98/solana-support-library/config";

import {
  Connection,
  Keypair,
  AddressLookupTableProgram,
  PublicKey,
} from "@solana/web3.js";
import {
  printAddressLookupTable,
  sendTransactionV0,
  extendLookupTable,
  delay,
  findOrCreateAtas,
  sendTransactionV0WithLookupTable,
  createArrTransferInstruction,
} from "./util";

import { BN } from "bn.js";

describe("multi-send", () => {
  const PROPRAM_ID = new PublicKey(
    "8eiyBeMJaFMkze8WAW8ehJDaNYrYUUim4A5h6tTto7eW"
  );
  const connection = new Connection("http://localhost:8899", "confirmed");
  let defaultAccount: Keypair;
  let testAccount1: Keypair;
  let testAccount2: Keypair;
  const derivedWalletSeed = Buffer.from("delegate");

  // Generate a random keypair that will represent our token
  const mintKey = Keypair.generate();
  let accounts: PublicKey[] = [];

  before(async () => {
    defaultAccount = await SolanaConfigService.getDefaultAccount();
    for (let i = 0; i < 4; i++) {
      accounts.push(Keypair.generate().publicKey);
    }
    testAccount1 = Keypair.generate();
    testAccount2 = Keypair.generate();
  });

  it("Mint token!", async () => {
    // Create a token mint
    await TokenProgramService.createTokenMint(
      connection,
      defaultAccount,
      mintKey,
      6,
      defaultAccount.publicKey,
      defaultAccount.publicKey
    );

    await TokenProgramService.mint(
      connection,
      defaultAccount,
      mintKey.publicKey,
      testAccount1.publicKey,
      new BN(2000000000)
    );

    await TokenProgramService.mint(
      connection,
      defaultAccount,
      mintKey.publicKey,
      testAccount2.publicKey,
      new BN(3000000000)
    );
  });

  it("Create, extend and multi send using Address Lookup Table", async () => {
    const [lookupTableInst, lookupTableAddress] =
      AddressLookupTableProgram.createLookupTable({
        authority: defaultAccount.publicKey,
        payer: defaultAccount.publicKey,
        recentSlot: await connection.getSlot("finalized"),
      });

    await sendTransactionV0(connection, [lookupTableInst], defaultAccount);
    await delay(1);
    await extendLookupTable(
      [...accounts],
      defaultAccount.publicKey,
      lookupTableAddress,
      defaultAccount,
      connection
    );
    await printAddressLookupTable(connection, lookupTableAddress);

    const toATAs = await findOrCreateAtas(
      mintKey.publicKey,
      accounts,
      connection,
      defaultAccount
    );
    const [PDA, bump] = PublicKey.findProgramAddressSync(
      [derivedWalletSeed],
      PROPRAM_ID
    );

    const fromTokenAccount1 = TokenProgramService.findAssociatedTokenAddress(
      testAccount1.publicKey,
      mintKey.publicKey
    );
    const fromTokenAccount2 = TokenProgramService.findAssociatedTokenAddress(
      testAccount2.publicKey,
      mintKey.publicKey
    );

    // Send some SOL to test
    await SystemProgramService.transfer(
      connection,
      defaultAccount,
      testAccount1.publicKey,
      1000000000
    );

    // Send some SOL to test
    await SystemProgramService.transfer(
      connection,
      defaultAccount,
      testAccount2.publicKey,
      1000000000
    );

    await TokenProgramService.approve(
      connection,
      testAccount1,
      fromTokenAccount1,
      PDA,
      new BN(10000000000)
    );
    await TokenProgramService.approve(
      connection,
      testAccount2,
      fromTokenAccount2,
      PDA,
      new BN(10000000000)
    );

    const tokenInst = await createArrTransferInstruction(
      [
        fromTokenAccount1,
        toATAs[0],
        fromTokenAccount2,
        toATAs[1],
        fromTokenAccount2,
        toATAs[2],
        fromTokenAccount1,
        toATAs[3],
      ],
      PDA,
      bump,
      [
        new BN(100000000),
        new BN(200000000),
        new BN(100000000),
        new BN(200000000),
      ],
      defaultAccount.publicKey
    );

    await sendTransactionV0WithLookupTable(
      connection,
      [tokenInst],
      defaultAccount,
      lookupTableAddress
    );
  });
});
