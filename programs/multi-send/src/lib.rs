pub mod external;

use anchor_lang::{prelude::*};

use crate::external::anchor_spl_token::{
    transfer_token
};
declare_id!("48q3G4p5qwXNuDoLmdiZxUyTZ1nqfwNwM4QFRzDFjqAd");

#[program]
pub mod multi_send {
    use super::*;

    pub fn multi_send<'a>(
        ctx: Context<'_, '_, '_, 'a, TransferToken<'a>>,
        amount: u64)-> Result<()> {

        let recipients = &ctx.remaining_accounts;
        let authority = &ctx.accounts.from_authority;
        
        for i in 0..recipients.len() {
          transfer_token(
              authority,
              &ctx.accounts.from,
              &recipients[i],
              amount,
              &[],
          )?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    /// CHECK: Program account that holds the token program id
    pub token_program: AccountInfo<'info>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    // the authority of the from account
    pub from_authority: Signer<'info>,
}
