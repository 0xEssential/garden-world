//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
.                                                                                                                                          .
.  .cxxo.                 ;dxxo:cdxxdxxxxxo::dxxc.   .ldxxxdxxxxxo' 'oxxxxxxxxxxxl.   .cdxxl.      .ldxxxxxxo::dxxxxxxxxo:cdxxxxxxxxxd:.   .
.  .OMMX;               .dNMMXkONMMMMMMMMXkONMMM0'  ;0WMMMWMMWMWKc'cKWMMMMMMMMMW0;   ,kWMW0;      ;0WMMMMMMXkONMMMMMMMWXkONMMMMMMMMMNx'    .
.  .OMMX;    .,,,.     ;OWMW0kKWMWXXWMMW0k0WMMMM0'.oXMWXdcccccc:''xNMWWKocccccc:.  .cKWMNx.     .oXMMXxcccldKWMWXXWWMW0k0WMWOlcccccc;.     .
.  .OMMX:   ;ONWWk.  .lXWMNOkXWMN0KNWMNOkXWWMMWM0lkWMMW0occcccc,:0WWWNXOlcccccc.  .xNMWKc.     'kWMW0;   .lXWMNKKNWWXxxXWMMXxcccccc:.      .
.  .OMMX: .oXMMMMO. 'kWMWKk0NMMWNNWMWKk0NMW0ONMM0kXMMMMMMMMMMMWOkWMMMMWMMMMMMMWl.:0WMWk'     .cKWMWk'   'kWMMMNNWMW0:'kMMMMMMMMMMMMX;      .
.  .OMMX:,kWMMMMMO,cKWMNOkKWMMMMMMWXOkKWMNx':XMM0ooxxxxxxONMMMNocdxxxxxxx0WMMMXodXMMXo.     .xNMMMW0kxclKWMMMMMMWXx. .cxxxxxxkKWMMWO'      .
.  .OMMN0KWMNNWMMX0NMWXkONMMKx0WMM0okNMMKl. ;XMM0:',,.  'xNMWKc..','.   ,OWMWKk0WMW0;      ;0WMMWWWWXkONMWKxOWMMO;.'''.     .cKWMNx'       .
.  .OMMMMMWKloNMMMMMW0kKWMWO, lNMMXXWMWO,   ;XMM0kKNNk';0WMWk,  lXNNo..lKWMNOkXMMNd.     .oXMMXd:::cdKWMWO, cNMMx.oNNNo    .dNMMXl.        .
.  .OMMMMWO, :NMMWWXkkXWMXo.  lNMMMMMXo.    ;XMM0kNMMXOXMWXo.   oWMWK0KNMWKkONWMWXdllll;;kWMMWKdlllxXMMXo.  cNMWx'dWMW0ollo0WMWO,          .
.  .OMMMXo.  :NMMWKk0WMW0;    lNMMWW0;      ;XMM0kNMMMMMW0;     oWMMMMMMN0kKWMMMMMMMMNOkXWMMMMMMMMMMMW0;    cNMMx'dWMMMMMMMMWXo.           .
.  .:ooo,    .looc;:oooc.     'ooool.       .looc:loooooc.      ,ooooooo:;coooooooooo:;loooooooooooooc.     'loo;.,oooooooooo;             .
.                                                                                                                                          .*/

import {EssentialForwarder} from "@xessential/contracts/fwd/EssentialForwarder.sol";

contract MudForwarder is EssentialForwarder {
    constructor(string[] memory _urls) EssentialForwarder() {
        _setOwnershipSigner(msg.sender);
    }
}
