// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@thirdweb-dev/contracts/extension/Ownable.sol";
import {Permissions} from "@thirdweb-dev/contracts/extension/Permissions.sol";
import {ContractMetadata} from "@thirdweb-dev/contracts/extension/ContractMetadata.sol";
import {PermissionsEnumerable} from "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import {ReentrancyGuard} from "@thirdweb-dev/contracts/external-deps/openzeppelin/security/ReentrancyGuard.sol";

/**
 * @title ArbInfo
 * @dev Interface for ApeChain's ArbInfo system contract to configure yield modes.
 */
interface ArbInfo {
    function configureAutomaticYield() external;
    function configureVoidYield() external;
    function configureDelegateYield(address delegate) external;
}

/**
 * @title IArbOwnerPublic
 * @dev Interface for ApeChain's ArbOwnerPublic system contract to query APY.
 */
interface IArbOwnerPublic {
    function getApy() external view returns (uint256);
}

/**
 * @title YieldMode
 * @dev Enum representing possible yield modes on ApeChain.
 */
enum YieldMode {
    AUTOMATIC,
    VOID,
    DELEGATE
}

/**
 * @title PrimapePrediction
 * @dev A multi-outcome, pari-mutuel style prediction market using the chain's native token, upgraded with Native Yield on ApeChain.
 *
 * Features:
 * - Multiple outcomes per market.
 * - Early resolution by the owner.
 * - Adjustable platform fees.
 * - Role-based access control (owner, market creators).
 * - A claim deadline after resolution, allowing leftover funds to be swept by the owner.
 * - Native Yield configuration and withdrawal.
 */
contract PrimapePrediction is Ownable, ReentrancyGuard, PermissionsEnumerable, ContractMetadata {
    struct Market {
        string question;
        uint256 endTime;
        bool resolved;
        uint256 winningOptionIndex; // If unresolved, set to type(uint256).max
        uint256 claimDeadline;      // After this, unclaimed funds can be swept by the owner
        uint256 totalPool;          // Tracks total funds available for claiming at resolution
    }

    // Role for market creators
    bytes32 public constant MARKET_CREATOR_ROLE = keccak256("MARKET_CREATOR_ROLE");

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    // Market data
    mapping(uint256 => string[]) public marketOptions;
    mapping(uint256 => mapping(uint256 => uint256)) public totalSharesPerOption; // marketId => optionIndex => total
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public userSharesPerOption; // user balances
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Platform fee (in basis points)
    uint256 public feeBps = 100; // 1% default
    uint256 public platformBalance;

    // Grace period (e.g., 30 days) after which owner can sweep unclaimed funds
    uint256 public constant CLAIM_GRACE_PERIOD = 30 days;

    // Events
    event MarketCreated(uint256 indexed marketId, string question, string[] options, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, uint256 optionIndex, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint256 winningOptionIndex);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event FeeUpdated(uint256 newFeeBps);
    event FeesWithdrawn(uint256 amount, address indexed recipient);
    event UnclaimedFundsSwept(uint256 indexed marketId, uint256 amount);
    event YieldModeConfigured(YieldMode yieldMode, address delegate);
    event YieldWithdrawn(uint256 amount);

    /**
     * @notice Constructor that sets the owner and enables Automatic Yield Mode by default
     */
    constructor() {
        _setupOwner(msg.sender);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Set to Automatic Yield Mode during deployment
        ArbInfo(0x0000000000000000000000000000000000000065).configureAutomaticYield();
    }

    /// @dev Ownable override
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /// @dev ContractMetadata override for setting contract URI
    function _canSetContractURI() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @notice Configure the yield mode for the contract on ApeChain
     * @param yieldMode The yield mode to set (AUTOMATIC, VOID, DELEGATE)
     * @param delegate The delegate address if DELEGATE mode is selected
     */
    function configureYieldMode(YieldMode yieldMode, address delegate) external onlyOwner {
        if (yieldMode == YieldMode.AUTOMATIC) {
            ArbInfo(0x0000000000000000000000000000000000000065).configureAutomaticYield();
        } else if (yieldMode == YieldMode.VOID) {
            ArbInfo(0x0000000000000000000000000000000000000065).configureVoidYield();
        } else if (yieldMode == YieldMode.DELEGATE) {
            require(delegate != address(0), "Invalid delegate address");
            ArbInfo(0x0000000000000000000000000000000000000065).configureDelegateYield(delegate);
        }
        emit YieldModeConfigured(yieldMode, delegate);
    }

    /**
     * @notice Get the current APY on ApeChain
     * @return The current APY in 10^(-9)ths of a percent (e.g., 5e9 = 5%)
     */
    function getCurrentAPY() public view returns (uint256) {
        return IArbOwnerPublic(0x000000000000000000000000000000000000006b).getApy();
    }

    /**
     * @notice Calculate the total funds committed to all markets
     * @return The total committed funds
     */
    function getTotalCommittedFunds() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < marketCount; i++) {
            Market storage market = markets[i];
            if (!market.resolved) {
                uint256 optionCount = marketOptions[i].length;
                for (uint256 j = 0; j < optionCount; j++) {
                    total += totalSharesPerOption[i][j];
                }
            } else {
                total += market.totalPool;
            }
        }
        return total;
    }

    /**
     * @notice Withdraw yield earned by the contract on ApeChain
     */
    function withdrawYield() external onlyOwner nonReentrant {
        uint256 committedFunds = getTotalCommittedFunds();
        uint256 yieldAmount = address(this).balance - committedFunds - platformBalance;
        require(yieldAmount > 0, "No yield to withdraw");
        (bool success, ) = payable(owner()).call{value: yieldAmount}("");
        require(success, "Transfer failed");
        emit YieldWithdrawn(yieldAmount);
    }

    /**
     * @notice Create a new market
     */
    function createMarket(
        string memory _question,
        string[] memory _options,
        uint256 _duration
    ) external returns (uint256) {
        require(msg.sender == owner() || hasRole(MARKET_CREATOR_ROLE, msg.sender), "Not authorized");
        require(_duration > 0, "Duration must be positive");
        require(_options.length >= 2, "At least two outcomes");

        uint256 marketId = marketCount++;
        Market storage market = markets[marketId];

        market.question = _question;
        market.endTime = block.timestamp + _duration;
        market.resolved = false;
        market.winningOptionIndex = type(uint256).max;

        for (uint256 i = 0; i < _options.length; i++) {
            marketOptions[marketId].push(_options[i]);
        }

        emit MarketCreated(marketId, _question, _options, market.endTime);
        return marketId;
    }

    /**
     * @notice Buy shares in a market outcome
     */
    function buyShares(uint256 _marketId, uint256 _optionIndex) external payable {
        Market storage market = markets[_marketId];
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.resolved, "Market resolved");
        require(_optionIndex < marketOptions[_marketId].length, "Invalid option");
        require(msg.value > 0, "No funds");

        uint256 feeAmount = (msg.value * feeBps) / 10000;
        uint256 netAmount = msg.value - feeAmount;

        platformBalance += feeAmount;
        userSharesPerOption[_marketId][msg.sender][_optionIndex] += netAmount;
        totalSharesPerOption[_marketId][_optionIndex] += netAmount;

        emit SharesPurchased(_marketId, msg.sender, _optionIndex, netAmount);
    }

    /**
     * @notice Resolve a market
     */
    function resolveMarket(uint256 _marketId, uint256 _winningOptionIndex) external {
        require(msg.sender == owner(), "Only owner");
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(_winningOptionIndex < marketOptions[_marketId].length, "Invalid outcome");

        market.winningOptionIndex = _winningOptionIndex;
        market.resolved = true;
        market.claimDeadline = block.timestamp + CLAIM_GRACE_PERIOD;

        uint256 optionCount = marketOptions[_marketId].length;
        uint256 totalPool = 0;
        for (uint256 i = 0; i < optionCount; i++) {
            totalPool += totalSharesPerOption[_marketId][i];
        }
        market.totalPool = totalPool;

        emit MarketResolved(_marketId, _winningOptionIndex);
    }

    /**
     * @notice Claim winnings
     */
    function claimWinnings(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        require(block.timestamp < market.claimDeadline, "Claim expired");
        require(!hasClaimed[_marketId][msg.sender], "Already claimed");

        uint256 winningOption = market.winningOptionIndex;
        uint256 userShares = userSharesPerOption[_marketId][msg.sender][winningOption];
        require(userShares > 0, "No winnings");

        uint256 winningShares = totalSharesPerOption[_marketId][winningOption];
        uint256 losingShares = 0;
        uint256 optionCount = marketOptions[_marketId].length;
        for (uint256 i = 0; i < optionCount; i++) {
            if (i != winningOption) {
                losingShares += totalSharesPerOption[_marketId][i];
            }
        }

        uint256 rewardRatio = winningShares > 0 ? (losingShares * 1e18) / winningShares : 0;
        uint256 winnings = userShares + (userShares * rewardRatio) / 1e18;

        userSharesPerOption[_marketId][msg.sender][winningOption] = 0;
        hasClaimed[_marketId][msg.sender] = true;
        market.totalPool -= winnings;

        (bool success, ) = payable(msg.sender).call{value: winnings}("");
        require(success, "Transfer failed");

        emit Claimed(_marketId, msg.sender, winnings);
    }

    /**
     * @notice Batch claim for multiple users
     */
    function batchClaimWinnings(uint256 _marketId, address[] calldata _users) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        require(block.timestamp < market.claimDeadline, "Claim expired");

        uint256 winningOption = market.winningOptionIndex;
        uint256 winningShares = totalSharesPerOption[_marketId][winningOption];
        uint256 losingShares = 0;
        uint256 optionCount = marketOptions[_marketId].length;
        for (uint256 i = 0; i < optionCount; i++) {
            if (i != winningOption) {
                losingShares += totalSharesPerOption[_marketId][i];
            }
        }

        uint256 rewardRatio = winningShares > 0 ? (losingShares * 1e18) / winningShares : 0;

        for (uint256 i = 0; i < _users.length; i++) {
            address user = _users[i];
            if (hasClaimed[_marketId][user]) continue;

            uint256 userShares = userSharesPerOption[_marketId][user][winningOption];
            if (userShares == 0) continue;

            uint256 winnings = userShares + (userShares * rewardRatio) / 1e18;
            hasClaimed[_marketId][user] = true;
            userSharesPerOption[_marketId][user][winningOption] = 0;

            market.totalPool -= winnings;

            (bool success, ) = payable(user).call{value: winnings}("");
            require(success, "Transfer failed");
            emit Claimed(_marketId, user, winnings);
        }
    }

    /**
     * @notice Sweep unclaimed funds after claim deadline
     */
    function sweepUnclaimedFunds(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Not resolved");
        require(block.timestamp > market.claimDeadline, "Deadline not passed");

        uint256 leftover = market.totalPool;
        market.totalPool = 0;

        if (leftover > 0) {
            (bool success, ) = payable(owner()).call{value: leftover}("");
            require(success, "Transfer failed");
        }

        emit UnclaimedFundsSwept(_marketId, leftover);
    }

    /**
     * @notice Get market info
     */
    function getMarketInfo(uint256 _marketId) external view returns (
        string memory question,
        uint256 endTime,
        bool resolved,
        uint256 winningOptionIndex
    ) {
        Market storage market = markets[_marketId];
        return (market.question, market.endTime, market.resolved, market.winningOptionIndex);
    }

    /**
     * @notice Get market options
     */
    function getMarketOptions(uint256 _marketId) external view returns (string[] memory) {
        string[] memory opts = new string[](marketOptions[_marketId].length);
        for (uint256 i = 0; i < marketOptions[_marketId].length; i++) {
            opts[i] = marketOptions[_marketId][i];
        }
        return opts;
    }

    /**
     * @notice Get total shares for each option
     */
    function getMarketTotalShares(uint256 _marketId) external view returns (uint256[] memory totals) {
        uint256 optionCount = marketOptions[_marketId].length;
        totals = new uint256[](optionCount);
        for (uint256 i = 0; i < optionCount; i++) {
            totals[i] = totalSharesPerOption[_marketId][i];
        }
    }

    /**
     * @notice Get user shares
     */
    function getUserShares(uint256 _marketId, address _user) external view returns (uint256[] memory balances) {
        uint256 optionCount = marketOptions[_marketId].length;
        balances = new uint256[](optionCount);
        for (uint256 i = 0; i < optionCount; i++) {
            balances[i] = userSharesPerOption[_marketId][_user][i];
        }
    }

    /**
     * @notice Update fee BPS
     */
    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    /**
     * @notice Withdraw platform fees
     */
    function withdrawFees(address payable _recipient, uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= platformBalance, "Not enough fees");
        platformBalance -= _amount;

        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Withdraw failed");

        emit FeesWithdrawn(_amount, _recipient);
    }
}