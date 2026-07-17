import type { FormApi, RuleItem } from "@douyinfe/semi-ui/lib/es/form";
import { REG_CODE_SIX, REG_EMAIL, REG_PHONE, REG_PWD, REG_USER_NAME } from "@forge/shared/utils";

function createRequiredRule(message: string): RuleItem {
  return {
    message,
    required: true,
  };
}

export function useAuthFormRules() {
  const { t } = useTranslation();

  const patternRules = {
    code: {
      message: t("form.code.invalid"),
      pattern: REG_CODE_SIX,
    },
    email: {
      message: t("form.email.invalid"),
      pattern: REG_EMAIL,
    },
    phone: {
      message: t("form.phone.invalid"),
      pattern: REG_PHONE,
    },
    pwd: {
      message: t("form.pwd.invalid"),
      pattern: REG_PWD,
    },
    username: {
      message: t("form.userName.invalid"),
      pattern: REG_USER_NAME,
    },
  } satisfies Record<string, RuleItem>;

  const formRules = {
    code: [createRequiredRule(t("form.code.required")), patternRules.code],
    email: [createRequiredRule(t("form.email.required")), patternRules.email],
    phone: [createRequiredRule(t("form.phone.required")), patternRules.phone],
    pwd: [createRequiredRule(t("form.pwd.required")), patternRules.pwd],
    username: [createRequiredRule(t("form.userName.required")), patternRules.username],
  } satisfies Record<string, RuleItem[]>;

  const defaultRequiredRule = createRequiredRule(t("form.required"));

  /** Semi Form：用 formApi 取 password 做确认密码校验 */
  function createConfirmPwdRule(formApi: FormApi | null) {
    const confirmPwdRule: RuleItem[] = [
      { message: t("form.confirmPwd.required"), required: true },
      {
        message: t("form.confirmPwd.invalid"),
        validator: (_rule, value) => {
          const pwd = formApi?.getValue("password" as never);
          const confirmPwd = typeof value === "string" ? value : "";

          if (confirmPwd.trim() !== "" && confirmPwd !== pwd) {
            return false;
          }

          return true;
        },
      },
    ];

    return confirmPwdRule;
  }

  return {
    createConfirmPwdRule,
    createRequiredRule,
    defaultRequiredRule,
    formRules,
    patternRules,
  };
}
