use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use spl_token::*;

declare_id!("ERw3L6bfcvBQR5pbm7gHiUU9cBKjLfYXSLMSreKYv1Cy");

#[program]
mod mysolanaapp {
    use super::*;

    pub fn create(ctx: Context<Create>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 10;
		base_account.authority = *ctx.accounts.user.key;
		msg!("Done successful");
		msg!("Account created by {}", *ctx.accounts.user.key);
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;
		msg!("The value is {}", ctx.accounts.base_account.count);
		msg!("Incremented by {}", *ctx.accounts.authority.key);	
        Ok(())
    }

	pub fn view(ctx: Context<View>) -> Result<()> {
		msg!("The value in view is {}", ctx.accounts.base_account.count);
		msg!("Viewed by {}", *ctx.accounts.viewer.key);
		Ok(())
	}

	pub fn close(ctx: Context<Close>) -> Result<()> {
		msg!("closed by {}", *ctx.accounts.target.key);
		Ok(())
	}
}

// Transaction instructions
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(
        init,
        seeds = [b"meta_data".as_ref(),
		user.to_account_info().key.as_ref()
		],
        bump,
        space = 100,
        payer = user
    )]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
		has_one = authority,
        seeds = [b"meta_data".as_ref(),
		authority.to_account_info().key.as_ref()
		],
        bump,
    )]
    pub base_account: Account<'info, BaseAccount>,
	pub authority: Signer<'info>,

	pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct View<'info> {

    #[account(
        seeds = [b"meta_data".as_ref(),
		viewer.to_account_info().key.as_ref()
		],
        bump,
    )]
    pub base_account : Account<'info, BaseAccount>,
    #[account(mut)]
    pub viewer: Signer<'info>,

	pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,	
}

#[derive(Accounts)]
pub struct Close<'info> {

    #[account(
		mut,
        seeds = [b"meta_data".as_ref(),
		target.to_account_info().key.as_ref()
		],
        bump,
		close = target,
    )]
    pub base_account : Account<'info, BaseAccount>,
    #[account(mut)]
    pub target: Signer<'info>,

	pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,	
}

// An account that goes inside a transaction instruction
#[account]
pub struct BaseAccount {
    pub count: u64,
	pub authority: Pubkey,
}
