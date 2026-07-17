import { ExceptionBase } from "@/shared/web-ui-semi";

const NotFound = () => {
  const { t } = useTranslation();

  return <ExceptionBase buttonText={t("common.backToHome")} type="404" />;
};

export default NotFound;
