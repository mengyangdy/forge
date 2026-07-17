import { createFileRoute } from "@tanstack/react-router";
import { Button, Form, Space } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useKeyPress } from "ahooks";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useAuthFormRules } from "@/features/auth/use-auth-form-rules";
import { useResetPasswordMutation } from "@/service/api";
import { showSemiSuccessToast, showErrorMessage } from "@/shared/admin-theme";

interface FormModel {
  code: string;
  confirmPassword: string;
  password: string;
  phone: string;
}

const ResetPwd = () => {
  const { t } = useTranslation();
  const formApiRef = useRef<FormApi<FormModel> | null>(null);
  const navigate = Route.useNavigate();
  const { createConfirmPwdRule, formRules } = useAuthFormRules();

  const { isPending, mutateAsync: resetPassword } = useResetPasswordMutation();

  async function handleSubmit(params: FormModel) {
    try {
      await resetPassword({
        phone: params.phone,
        password: params.password,
        code: params.code,
      });
      showSemiSuccessToast("密码重置成功，请登录");
      void navigate({ to: "/login" });
    } catch (error: any) {
      showErrorMessage(error instanceof Error ? error.message : "密码重置失败");
    }
  }

  useKeyPress("enter", () => {
    formApiRef.current?.submitForm();
  });

  return (
    <>
      <h3 className="text-18px text-primary font-medium">{t("page.login.resetPwd.title")}</h3>
      <Form
        className="pt-24px"
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        onSubmit={handleSubmit}
      >
        <Form.Input
          field="phone"
          noLabel
          placeholder={t("page.login.common.phonePlaceholder")}
          rules={formRules.phone}
          size="large"
        />

        <div className="mb-12px w-full flex-y-center gap-16px">
          <Form.Input
            className="flex-1"
            field="code"
            noLabel
            placeholder={t("page.login.common.codePlaceholder")}
            rules={formRules.code}
            size="large"
          />
          <Button size="large">{t("page.login.common.getCode")}</Button>
        </div>

        <Form.Input
          autoComplete="password"
          field="password"
          mode="password"
          noLabel
          placeholder={t("page.login.common.passwordPlaceholder")}
          rules={formRules.pwd}
          size="large"
        />

        <Form.Input
          autoComplete="confirm-password"
          field="confirmPassword"
          mode="password"
          noLabel
          placeholder={t("page.login.common.confirmPasswordPlaceholder")}
          rules={createConfirmPwdRule(formApiRef.current)}
          size="large"
        />

        <Space vertical align="start" className="w-full" spacing={18}>
          <Button
            block
            htmlType="submit"
            loading={isPending}
            size="large"
            theme="solid"
            type="primary"
          >
            {t("common.confirm")}
          </Button>

          <Button block size="large" theme="light" onClick={() => void navigate({ to: "/login" })}>
            {t("page.login.common.back")}
          </Button>
        </Space>
      </Form>
    </>
  );
};

export const Route = createFileRoute("/(auth)/login/reset-pwd/")({
  component: ResetPwd,
  staticData: {
    title: "reset-pwd",
    i18nKey: "route.login_reset-pwd",
  },
});
