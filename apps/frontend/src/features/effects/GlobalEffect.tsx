import { LangEffect } from "@/shared/admin-i18n";
import { ThemeEffect } from "@/shared/admin-theme";

import { syncLocales } from "@/locales/sync";

const GlobalEffect = () => {
  return (
    <>
      <ThemeEffect />
      <LangEffect onLocaleChange={syncLocales} />
    </>
  );
};

export default GlobalEffect;
