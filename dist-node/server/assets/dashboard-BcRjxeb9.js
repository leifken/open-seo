import { z } from "zod";
z.enum([
  "domain",
  "mcp",
  "gsc",
  "competitor"
]);
const dashboardProjectInputSchema = z.object({
  projectId: z.string().min(1)
});
export {
  dashboardProjectInputSchema as d
};
