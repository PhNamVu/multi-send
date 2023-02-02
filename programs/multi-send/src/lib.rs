use anchor_lang::{prelude::*, accounts::program_account::ProgramAccount};
use anchor_spl::token::{Token, Transfer};

declare_id!("CYtTx9XGqxEJSjxXvNz2ZYgC2J8brQGL5vj6uAi1ukQr");

#[program]
pub mod multi_send {
    use super::*;

    pub fn transfer_token(ctx: Context<TransferToken>, amount: u64)-> Result<()> {
        
        let instructions = vec![];
        let recipients = ctx.accounts.recipients;
        for recipient in recipients {
            // Create the Transfer struct for our context
            let transfer_instruction = Transfer{
                from: ctx.accounts.from.to_account_info(),
                to: recipient.to_account_info(),
                authority: ctx.accounts.from_authority.to_account_info(),
            };
            instructions.push(transfer_instruction);
            
        }
        let cpi_program = ctx.accounts.token_program.to_account_info();
            // Create the Context for our Transfer request
        let cpi_ctx = CpiContext::new(cpi_program, instructions);
        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx , amount)?;
 
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: The associated token account that we are transferring the token to
    #[account(mut)]
    pub recipients: ,
    // the authority of the from account 
    pub from_authority: Signer<'info>,
}

#[account]
pub struct Recipient {
    pub recipient: Pubkey,
}