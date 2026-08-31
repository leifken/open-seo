import { useQuery } from "@tanstack/react-query";
import { g as getProjects } from "./projects-D9ZqZqTc.js";
function useProjectMarket(projectId) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  return projectsQuery.data?.find((project) => project.id === projectId);
}
export {
  useProjectMarket as u
};
