use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The amount of recipients and amounts must be equal.")]
    InvalidInput,
}
