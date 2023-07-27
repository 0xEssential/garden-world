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
      console.log(entity);
      try {
        const project = getComponentValueStrict(Projects, entity);
        return [
          ...acc,
          { ...project, contractAddress: "0x" + entity.slice(-40) },
        ];
      } catch (e) {
        return acc;
      }
    },
    [] as any[]
  );
  console.warn(projects);
  return (
    <div className="main">
      <div className="plant-grid">
        {projects.map((project: any) => (
          <MintablePlant project={project} key={project.contractAddress} />
        ))}
      </div>
    </div>
  );
};
