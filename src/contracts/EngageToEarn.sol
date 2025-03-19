
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EngageToEarn
 * @dev Contract for Primape's Engage to Earn program
 */
contract EngageToEarn is Ownable, ReentrancyGuard {
    IERC20 public apeToken;
    
    // Points and rewards tracking
    mapping(address => uint256) public userPoints;
    mapping(address => uint256) public lastClaimTimestamp;
    mapping(address => uint256) public totalPointsEarned;
    mapping(address => uint256) public totalRewardsClaimed;
    
    // Creator relations
    mapping(address => bool) public approvedCreators;
    mapping(address => address) public creatorToOracle;
    
    // User verification
    mapping(address => string) public userTwitterHandles;
    mapping(string => address) public twitterHandleToUser;
    
    // Anti-gaming
    mapping(address => mapping(uint8 => uint256)) public lastEngagementTimestamp;
    mapping(address => mapping(uint8 => uint256)) public dailyEngagementCount;
    mapping(address => uint256) public lastDailyReset;
    
    // Constants
    uint256 public constant POINTS_PER_APE = 1000; // 1000 points = 1 $APE
    uint256 public constant DAILY_RESET_PERIOD = 1 days;
    
    // Engagement types
    uint8 public constant ENGAGEMENT_LISTEN = 1;
    uint8 public constant ENGAGEMENT_QUESTION = 2;
    uint8 public constant ENGAGEMENT_COMMENT = 3;
    uint8 public constant ENGAGEMENT_SHARE = 4;
    uint8 public constant ENGAGEMENT_PROMOTE = 5;
    uint8 public constant ENGAGEMENT_READ = 6;
    
    // Anti-gaming settings
    struct EngagementLimit {
        uint256 cooldownPeriod; // seconds between engagements
        uint256 dailyLimit;     // max per day
        uint256 basePoints;     // base points for this engagement
    }
    
    mapping(uint8 => EngagementLimit) public engagementLimits;
    
    // Events
    event PointsEarned(address indexed user, uint256 points, uint8 engagementType, string creatorHandle);
    event RewardsClaimed(address indexed user, uint256 apeAmount);
    event CreatorAdded(address indexed creator, address indexed oracle);
    event CreatorRemoved(address indexed creator);
    event TwitterHandleLinked(address indexed user, string twitterHandle);
    event EngagementLimitUpdated(uint8 engagementType, uint256 cooldown, uint256 dailyLimit, uint256 basePoints);
    
    /**
     * @dev Constructor sets the APE token address
     */
    constructor(address _apeToken) Ownable(msg.sender) {
        apeToken = IERC20(_apeToken);
        
        // Set default engagement limits
        engagementLimits[ENGAGEMENT_LISTEN] = EngagementLimit(1 hours, 5, 500);
        engagementLimits[ENGAGEMENT_QUESTION] = EngagementLimit(2 hours, 3, 750);
        engagementLimits[ENGAGEMENT_COMMENT] = EngagementLimit(30 minutes, 10, 450);
        engagementLimits[ENGAGEMENT_SHARE] = EngagementLimit(1 hours, 5, 600);
        engagementLimits[ENGAGEMENT_PROMOTE] = EngagementLimit(24 hours, 2, 1000);
        engagementLimits[ENGAGEMENT_READ] = EngagementLimit(30 minutes, 10, 400);
    }
    
    /**
     * @dev Add points to a user - can only be called by approved oracles
     */
    function addPoints(
        address _user, 
        uint256 _points, 
        uint8 _engagementType, 
        string calldata _creatorHandle
    ) external nonReentrant {
        // Verify caller is an approved oracle
        address creator;
        bool isApprovedOracle = false;
        
        for (uint i = 0; i < getCreatorCount(); i++) {
            creator = getCreatorAtIndex(i);
            if (creatorToOracle[creator] == msg.sender) {
                isApprovedOracle = true;
                break;
            }
        }
        
        require(isApprovedOracle, "Caller is not an approved oracle");
        
        // Verify user has linked Twitter
        require(bytes(userTwitterHandles[_user]).length > 0, "User has not linked Twitter");
        
        // Anti-gaming checks
        require(_engagementType >= ENGAGEMENT_LISTEN && _engagementType <= ENGAGEMENT_READ, "Invalid engagement type");
        
        // Check if we need to reset daily counts
        if (block.timestamp - lastDailyReset[_user] >= DAILY_RESET_PERIOD) {
            lastDailyReset[_user] = block.timestamp;
            for (uint8 i = ENGAGEMENT_LISTEN; i <= ENGAGEMENT_READ; i++) {
                dailyEngagementCount[_user][i] = 0;
            }
        }
        
        // Check cooldown period
        require(
            block.timestamp - lastEngagementTimestamp[_user][_engagementType] >= engagementLimits[_engagementType].cooldownPeriod,
            "Cooldown period not passed"
        );
        
        // Check daily limit
        require(
            dailyEngagementCount[_user][_engagementType] < engagementLimits[_engagementType].dailyLimit,
            "Daily engagement limit reached"
        );
        
        // Record engagement
        lastEngagementTimestamp[_user][_engagementType] = block.timestamp;
        dailyEngagementCount[_user][_engagementType]++;
        
        // Add points
        userPoints[_user] += _points;
        totalPointsEarned[_user] += _points;
        
        emit PointsEarned(_user, _points, _engagementType, _creatorHandle);
    }
    
    /**
     * @dev Claim APE tokens based on points
     */
    function claimRewards(uint256 _pointsToConvert) external nonReentrant {
        require(_pointsToConvert > 0, "Must convert positive points");
        require(userPoints[msg.sender] >= _pointsToConvert, "Not enough points");
        
        uint256 apeAmount = _pointsToConvert / POINTS_PER_APE;
        require(apeAmount > 0, "Not enough points to claim any APE");
        
        // Ensure contract has enough APE
        require(apeToken.balanceOf(address(this)) >= apeAmount, "Contract doesn't have enough APE");
        
        // Update points
        userPoints[msg.sender] -= _pointsToConvert;
        totalRewardsClaimed[msg.sender] += apeAmount;
        lastClaimTimestamp[msg.sender] = block.timestamp;
        
        // Transfer APE tokens
        bool success = apeToken.transfer(msg.sender, apeAmount);
        require(success, "APE transfer failed");
        
        emit RewardsClaimed(msg.sender, apeAmount);
    }
    
    /**
     * @dev Link a Twitter handle to a user address
     */
    function linkTwitterHandle(address _user, string calldata _twitterHandle) external {
        // In production, this would be called by a verification server after validating
        // that the user controls both the address and the Twitter account
        
        // Only owner or the user themselves can link
        require(msg.sender == owner() || msg.sender == _user, "Unauthorized");
        
        // Check if handle is already linked
        require(twitterHandleToUser[_twitterHandle] == address(0), "Twitter handle already linked");
        
        // Clear previous handle if it exists
        if (bytes(userTwitterHandles[_user]).length > 0) {
            string memory oldHandle = userTwitterHandles[_user];
            twitterHandleToUser[oldHandle] = address(0);
        }
        
        // Link new handle
        userTwitterHandles[_user] = _twitterHandle;
        twitterHandleToUser[_twitterHandle] = _user;
        
        emit TwitterHandleLinked(_user, _twitterHandle);
    }
    
    /**
     * @dev Add a creator and their oracle
     */
    function addCreator(address _creator, address _oracle) external onlyOwner {
        require(_creator != address(0), "Invalid creator address");
        require(_oracle != address(0), "Invalid oracle address");
        
        approvedCreators[_creator] = true;
        creatorToOracle[_creator] = _oracle;
        
        emit CreatorAdded(_creator, _oracle);
    }
    
    /**
     * @dev Remove a creator
     */
    function removeCreator(address _creator) external onlyOwner {
        require(approvedCreators[_creator], "Not an approved creator");
        
        approvedCreators[_creator] = false;
        creatorToOracle[_creator] = address(0);
        
        emit CreatorRemoved(_creator);
    }
    
    /**
     * @dev Update engagement limits
     */
    function updateEngagementLimit(
        uint8 _engagementType,
        uint256 _cooldownPeriod,
        uint256 _dailyLimit,
        uint256 _basePoints
    ) external onlyOwner {
        require(_engagementType >= ENGAGEMENT_LISTEN && _engagementType <= ENGAGEMENT_READ, "Invalid engagement type");
        
        engagementLimits[_engagementType] = EngagementLimit(_cooldownPeriod, _dailyLimit, _basePoints);
        
        emit EngagementLimitUpdated(_engagementType, _cooldownPeriod, _dailyLimit, _basePoints);
    }
    
    /**
     * @dev Get all approved creators
     */
    function getCreatorCount() public view returns (uint256) {
        uint256 count = 0;
        address[] memory allAddresses = new address[](1000); // Arbitrary large number
        
        for (uint i = 0; i < allAddresses.length; i++) {
            address addr = address(uint160(i + 1)); // Start from address 1
            if (approvedCreators[addr]) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * @dev Get creator at specific index
     */
    function getCreatorAtIndex(uint256 _index) public view returns (address) {
        uint256 count = 0;
        address[] memory allAddresses = new address[](1000); // Arbitrary large number
        
        for (uint i = 0; i < allAddresses.length; i++) {
            address addr = address(uint160(i + 1)); // Start from address 1
            if (approvedCreators[addr]) {
                if (count == _index) {
                    return addr;
                }
                count++;
            }
        }
        
        revert("Creator index out of bounds");
    }
    
    /**
     * @dev Withdraw APE tokens from contract (emergency function)
     */
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be positive");
        require(apeToken.balanceOf(address(this)) >= _amount, "Not enough tokens");
        
        bool success = apeToken.transfer(owner(), _amount);
        require(success, "Transfer failed");
    }
}
