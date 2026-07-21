import { createFileRoute } from "@tanstack/react-router";

import CustomPage from "./modules/CustomPage";

export const Route = createFileRoute("/(admin)/ai/custom/")({
  component: CustomPage,
});
