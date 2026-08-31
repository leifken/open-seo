import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { M as Modal } from "./Modal-81iy_nBW.js";
import { p as getStandardErrorMessage } from "./router-BZ-5uDXB.js";
import { s as setLastProjectId } from "./active-project-DUKzBpe_.js";
import { aF as DEFAULT_LOCATION_CODE, a9 as getLanguageCode } from "../entry.js";
import { P as ProjectMarketFields } from "./ProjectMarketFields-CTL7QZ2E.js";
import { c as createProject } from "./projects-D9ZqZqTc.js";
function CreateProjectModal({ onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [market, setMarket] = React.useState({
    locationCode: DEFAULT_LOCATION_CODE,
    languageCode: getLanguageCode(DEFAULT_LOCATION_CODE)
  });
  const createMutation = useMutation({
    mutationFn: () => createProject({
      data: {
        name: name.trim(),
        domain: domain.trim() || void 0,
        ...market
      }
    }),
    onSuccess: async (created) => {
      setLastProjectId(created.id);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
      toast.success("Project created");
      void navigate({
        to: "/p/$projectId/settings/integrations",
        params: { projectId: created.id }
      });
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Failed to create project"))
  });
  const isPending = createMutation.isPending;
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isPending) return;
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    createMutation.mutate();
  };
  return /* @__PURE__ */ jsx(
    Modal,
    {
      maxWidth: "max-w-md",
      onClose: isPending ? void 0 : onClose,
      labelledBy: "create-project-title",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h2", { id: "create-project-title", className: "text-lg font-semibold", children: "New project" }),
        /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: name,
              onChange: (event) => setName(event.target.value),
              placeholder: "Acme Inc.",
              maxLength: 120,
              autoFocus: true,
              className: "input input-bordered w-full"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5 text-sm", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            "Domain ",
            /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: domain,
              onChange: (event) => setDomain(event.target.value),
              placeholder: "example.com",
              maxLength: 255,
              className: "input input-bordered w-full"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "You can connect Search Console and set up rank tracking after creating the project." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx(ProjectMarketFields, { value: market, onChange: setMarket }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "Keyword, SERP, and domain data uses this country and language unless a call asks for a different one. Change it later in project settings." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm",
              onClick: onClose,
              disabled: isPending,
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "btn btn-primary btn-sm",
              disabled: isPending,
              children: "Create project"
            }
          )
        ] })
      ] })
    }
  );
}
export {
  CreateProjectModal as C
};
