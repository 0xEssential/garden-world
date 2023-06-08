# Untitled Garden Game

Untitled Garden Game is an Autonomous World built with the [MUD framework by Lattice](https://mud.dev/). 

The project explores how to make onchain AW games more accessible, open and interoperable. It also serves as a demo app for integrating [0xEssential tooling](https://docs.0xessential.com) with a MUD project to add functionality for crosschain token-gating, meta-transactions, burner wallets and account abstraction with DelegateCash.

### Open Gardens, Amorphous Worlds

The Autonomous World games we've seen so far have offered deeply defined worlds manipulable only by engineers. Projects like Dark Forest and OPCraft define their worlds as complete environments more akin to a universe - whole cloth sandboxes that invite others to come play within defined rules and systems. Participation in these Autonomous Worlds has been limited by technical proficiency, where engineers must write code and deploy smart contracts to create new world functionality or systems.

UGG aims to take a slightly different approach, with much respect to the other AW builders. The gardening world is not a universe, it's a composable sphere that contains a single class of object - plants! Our world doesn't have weather, it doesn't have lore. There aren't any physics, or water scarcity, or even sunlight. 

A more deeply defined world might attempt a more immersive simulation with pest infestation, or climate, or an economy. UGG is a grouping of similar objects you care about with simple, portable game mechanics. It can exist on it's own, but it's also oriented towards being integrated into other experiences.

UGG's simplicity enables a more open and acessible world for a wider array of creators, not just engineers. Anyone can create their own PlaNFT species - for free, without writing any code. Design a sprite sheet for a plant, configure some game mechanics, set your mint price and supply, and UGG deploys an NFT contract for you.

Your plant species is automatically registered in the Garden World for anyone to mint and grow (we do charge a 2% fee on mints). You own the contract - manage it on marketplaces, maintain provenance - it's a standard ERC721 contract with the added benefit of UGG integration.

### Gameplay
<img width="1203" alt="Screenshot 2023-05-31 at 5 12 02 PM" src="https://github.com/0xEssential/garden-world/assets/923033/48c6d401-e6d7-4302-9f70-ebd50fd7a208">

The goal of the game is to grow plants. Every plant is an NFT you mint and sow in your garden. Plants must be watered regularly or else they die.

Every species has a `lifecycleBlocks` value configured by creator, and the world uses block numbers to determine the status of each plant. When you sow a plant, it starts the water clock. Once 75% of `lifecycleBlocks` pass your plant is ready to be watered. If `lifecycleBlocks` pass between waterings, the plant dies. Dead plants can be composted, giving the grower back a seed to replant.

Plants have lifecycle stages - they progress from `SEEDLING` to `BUD` to a flowering stage. Every species has a `lifecycleLength` that determines how many waterings must be performed before a plant progresses to the next stage.

Plants have 4 rarity tiers, determined when a `BUD` progresses to the flowering stage. UGG handles rarity calculation onchain with a `50% / 30% / 15% / 5%` distribution. 

Plants disperse seeds - after 50 waterings, the AW will mint another seed the player can plant (or sell!). Dispersed seeds will have the same rarity as the parent plant.
