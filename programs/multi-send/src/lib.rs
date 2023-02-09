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
        let accounts = &ctx.remaining_accounts;
        let authority = &ctx.accounts.contract_signer;

        require!(is_even(accounts.len()), InvalidInput);
        for i in (0..accounts.len()).step_by(2) {
            let seeds = &[b"delegate".as_ref(), &[bump]];
            transfer_token(
                authority,    // approved PDA
                &accounts[i], // ata from
                &accounts[i+1],
                amount[i / 2],
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
    /// CHECK: The PDA that is the delegate
    #[account(
        seeds = [
            b"delegate".as_ref(),
        ],
        bump = bump,
    )]
    pub contract_signer: UncheckedAccount<'info>,
    pub manager: Signer<'info>,
}

fn is_even(number: usize) -> bool {
    if number % 2 == 0 {
        return true;
    }
    false
}

