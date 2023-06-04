import { useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import { Has, getComponentValueStrict } from "@latticexyz/recs";

import { MintablePlant } from "./components/MintablePlant";

export const Nursery = () => {
  const {
    components: { Projects },
  } = useMUD();

  const projects = [...useEntityQuery([Has(Projects)])].reduce(
    (acc, entity) => {
      try {
        const project = getComponentValueStrict(Projects, entity);
        return [...acc, { ...project, contractAddress: entity }];
      } catch (e) {
        return acc;
      }
    },
    [] as any[]
  );

  return (
    <div className="main">
      <div className="plant-grid">
        {projects.map((project) => (
          <MintablePlant project={project} key={project.contractAddress} />
        ))}
      </div>
    </div>
  );
};
