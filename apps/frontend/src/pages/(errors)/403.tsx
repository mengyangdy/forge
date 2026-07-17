import { ExceptionBase } from "@/shared/web-ui-semi";
import { createFileRoute } from "@tanstack/react-router";

const NotAuth = () => {
  const { t } = useTranslation();

  return <ExceptionBase buttonText={t("common.backToHome")} type="403" />;
};

export const Route = createFileRoute("/(errors)/403")({
  component: NotAuth,
  staticData: {
    title: "403",
    i18nKey: "route.403",
  },
});
