import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Delete } from "../target/types/delete";

describe("delete", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Delete as Program<Delete>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
