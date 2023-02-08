pub mod external;

use crate::external::anchor_spl_token::transfer_token;
use crate::external::error::ErrorCode;
use anchor_lang::prelude::*;
declare_id!("8eiyBeMJaFMkze8WAW8ehJDaNYrYUUim4A5h6tTto7eW");

#[program]
pub mod multi_send {
    use super::*;

    pub fn multi_send<'a>(
        ctx: Context<'_, '_, '_, 'a, TransferDelegate<'a>>, // remaining_accounts: &[AccountInfo<'a>]
        bump: u8,
        amount: Vec<u64>,
    ) -> Result<()> {
        let recipients = &ctx.remaining_accounts;
        let authority = &ctx.accounts.contract_signer;

        require!(recipients.len() == amount.len(), InvalidInput);
        for i in 0..recipients.len() {
            let seeds = &[b"delegate".as_ref(), &[bump]];
            transfer_token(
                authority,          // approved PDA
                &ctx.accounts.from, // ata from
                &recipients[i],
                amount[i],
                &[seeds],
            )?;
        }
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct TransferDelegate<'info> {
    /// CHECK: Program account that holds the token program id
    pub token_program: AccountInfo<'info>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>, // ata
    /// CHECK:
    #[account(
        seeds = [
            b"delegate".as_ref(),
        ],
        bump = bump,
    )]
    pub contract_signer: UncheckedAccount<'info>,

    pub manager: Signer<'info>,
}
