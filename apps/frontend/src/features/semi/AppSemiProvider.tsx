import { useLang } from "@/shared/admin-i18n";
import { SemiProvider } from "@/shared/admin-theme";
import type { PropsWithChildren } from "react";

import { useUserInfoQuery } from "@/service/api";
import { semiLocales } from "@/locales/semi";

/** 应用层 Semi Provider：注入当前语言 locale + 水印用户名。 */
const AppSemiProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { locale } = useLang();
  const { data: userInfo } = useUserInfoQuery();

  return (
    <SemiProvider locale={semiLocales[locale]} userName={userInfo?.username}>
      {children}
    </SemiProvider>
  );
};

export default AppSemiProvider;
