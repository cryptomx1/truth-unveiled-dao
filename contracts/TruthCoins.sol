// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TruthCoins
 * @dev Truth Unveiled Civic Genome NFT Contract with 8-Pillar Guardian System
 */
contract TruthCoins is ERC721, Ownable {
    
    enum Pillar {
        GOVERNANCE,
        IDENTITY, 
        PRIVACY,
        JUSTICE,
        EDUCATION,
        ENGAGEMENT,
        AMENDMENT,
        CONSENSUS
    }
    
    struct TruthCoin {
        Pillar pillar;
        address guardian;
        uint256 mintTimestamp;
        string zkpHash;
        bool isGenesis;
    }
    
    mapping(uint256 => TruthCoin) public truthCoins;
    mapping(Pillar => address) public pillarGuardians;
    uint256 private _tokenIdCounter;
    
    event TruthCoinMinted(uint256 indexed tokenId, Pillar pillar, address indexed recipient);
    event GuardianAssigned(Pillar pillar, address guardian);
    
    constructor() ERC721("TruthCoins", "TRUTH") Ownable(msg.sender) {
        // Initialize guardian assignments
        pillarGuardians[Pillar.GOVERNANCE] = address(0x1); // Athena placeholder
        pillarGuardians[Pillar.IDENTITY] = address(0x2); // Artemis placeholder  
        pillarGuardians[Pillar.PRIVACY] = address(0x3); // Sophia placeholder
        pillarGuardians[Pillar.JUSTICE] = address(0x4); // Themis placeholder
        pillarGuardians[Pillar.EDUCATION] = address(0x5); // Apollo placeholder
        pillarGuardians[Pillar.ENGAGEMENT] = address(0x6); // Hermes placeholder
        pillarGuardians[Pillar.AMENDMENT] = address(0x7); // Minerva placeholder
        pillarGuardians[Pillar.CONSENSUS] = address(0x8); // Demeter placeholder
    }
    
    /**
     * @dev Get guardian for specific pillar (for tooltip UI)
     * @param pillar The pillar to query
     * @return Guardian address for the pillar
     */
    function getGuardianForPillar(Pillar pillar) external view returns (address) {
        return pillarGuardians[pillar];
    }
    
    /**
     * @dev Get guardian name for UI display
     * @param pillar The pillar to query
     * @return Guardian name string
     */
    function getGuardianName(Pillar pillar) external pure returns (string memory) {
        if (pillar == Pillar.GOVERNANCE) return "Athena";
        if (pillar == Pillar.IDENTITY) return "Artemis";
        if (pillar == Pillar.PRIVACY) return "Sophia";
        if (pillar == Pillar.JUSTICE) return "Themis";
        if (pillar == Pillar.EDUCATION) return "Apollo";
        if (pillar == Pillar.ENGAGEMENT) return "Hermes";
        if (pillar == Pillar.AMENDMENT) return "Minerva";
        if (pillar == Pillar.CONSENSUS) return "Demeter";
        revert("Invalid pillar");
    }
    
    /**
     * @dev Mint TruthCoin with ZKP validation
     * @param recipient Address to receive the token
     * @param pillar Pillar type for the token
     * @param zkpHash Zero-knowledge proof hash
     * @param isGenesis Whether this is a genesis token
     */
    function mintTruthCoin(
        address recipient,
        Pillar pillar,
        string calldata zkpHash,
        bool isGenesis
    ) external onlyOwner {
        uint256 tokenId = _tokenIdCounter++;
        
        truthCoins[tokenId] = TruthCoin({
            pillar: pillar,
            guardian: pillarGuardians[pillar],
            mintTimestamp: block.timestamp,
            zkpHash: zkpHash,
            isGenesis: isGenesis
        });
        
        _safeMint(recipient, tokenId);
        emit TruthCoinMinted(tokenId, pillar, recipient);
    }
    
    /**
     * @dev Assign new guardian to pillar
     * @param pillar Pillar to assign guardian to
     * @param guardian New guardian address
     */
    function assignGuardian(Pillar pillar, address guardian) external onlyOwner {
        pillarGuardians[pillar] = guardian;
        emit GuardianAssigned(pillar, guardian);
    }
}