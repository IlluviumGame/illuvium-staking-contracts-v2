// copy and export all the features and roles export constants from IlluviumERC20

// Enables ERC20 transfers of the tokens (transfer by the token owner himself)
export const FEATURE_TRANSFERS = 0x0000_0001;

// Enables ERC20 transfers on behalf (transfer by someone else on behalf of token owner)
export const FEATURE_TRANSFERS_ON_BEHALF = 0x0000_0002;

// Defines if the default behavior of `transfer` and `transferFrom`
// checks if the receiver smart contract supports ERC20 tokens
export const FEATURE_UNSAFE_TRANSFERS = 0x0000_0004;

// Enables token owners to burn their own tokens, including locked tokens which are burnt first
export const FEATURE_OWN_BURNS = 0x0000_0008;

// Enables approved operators to burn tokens on behalf of their owners, including locked tokens which are burnt first
export const FEATURE_BURNS_ON_BEHALF = 0x0000_0010;

// Enables delegators to elect delegates
export const FEATURE_DELEGATIONS = 0x0000_0020;

// Enables delegators to elect delegates on behalf (via an EIP712 signature)
export const FEATURE_DELEGATIONS_ON_BEHALF = 0x0000_0040;

// All the features all together
export const FEATURE_ALL = 0x0000_FFFF;

// Token creator is responsible for creating (minting) tokens to an arbitrary address
export const ROLE_TOKEN_CREATOR = 0x0001_0000;

// Token destroyer is responsible for destroying (burning) tokens owned by an arbitrary address
export const ROLE_TOKEN_DESTROYER = 0x0002_0000;

// ERC20 receivers are allowed to receive tokens without ERC20 safety checks,
// which may be useful to simplify tokens transfers into "legacy" smart contracts
export const ROLE_ERC20_RECEIVER = 0x0004_0000;

// ERC20 senders are allowed to send tokens without ERC20 safety checks,
// which may be useful to simplify tokens transfers into "legacy" smart contracts
export const ROLE_ERC20_SENDER = 0x0008_0000;

// Access manager is responsible for assigning the roles to users,
// enabling/disabling global features of the smart contract
export const BN = require("web3").utils.BN;
export const ROLE_ACCESS_MANAGER = new BN(2).pow(new BN(255));
