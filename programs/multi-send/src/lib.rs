use anchor_lang::{prelude::*};
use anchor_spl::token::{Token};

use crate::external::anchor_spl_token::{
    transfer_token
  };
declare_id!("CYtTx9XGqxEJSjxXvNz2ZYgC2J8brQGL5vj6uAi1ukQr");

#[program]
pub mod multi_send {
    use super::*;

    pub fn transfer_token<'a>(
        ctx: Context<'_, '_, '_, 'a, TransferToken<'a>>,
        amount: u64)-> Result<()> {
        
        let recipients: &&[AccountInfo] = &ctx.remaining_accounts;
        let authority = &ctx.accounts.from_authority;
        for recipient in recipients {
          transfer_token(
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.from.to_account_info(),
            recipient.to_account_info(),
            authority.to_account_info(),
            amount,
            &[],
          )?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    // the authority of the from account 
    pub from_authority: Signer<'info>,
}
