import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MultiSend } from "../target/types/multi_send";

describe("multi-send", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MultiSend as Program<MultiSend>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
