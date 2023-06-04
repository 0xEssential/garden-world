// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* Autogenerated file. Do not edit manually. */

import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";

import { IPlantSystem } from "./IPlantSystem.sol";
import { IProjectSystem } from "./IProjectSystem.sol";
import { ISpeciesSystem } from "./ISpeciesSystem.sol";

/**
 * The IWorld interface includes all systems dynamically added to the World
 * during the deploy process.
 */
interface IWorld is IBaseWorld, IPlantSystem, IProjectSystem, ISpeciesSystem {

}
