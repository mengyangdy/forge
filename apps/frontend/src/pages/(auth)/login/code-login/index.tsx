import { createFileRoute } from "@tanstack/react-router";
import { Button, Form, Space } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useKeyPress } from "ahooks";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useAuthFormRules } from "@/features/auth/use-auth-form-rules";
import { useInitLogin } from "@/features/auth/use-login";

type FormValues = {
  code: string;
  phone: string;
};

const CodeLogin = () => {
  const { t } = useTranslation();
  const formApiRef = useRef<FormApi<FormValues> | null>(null);
  const { formRules } = useAuthFormRules();
  const navigate = Route.useNavigate();

  const { loading, login } = useInitLogin();

  function handleSubmit(params: FormValues) {
    void login({
      type: "code",
      phone: params.phone,
      code: params.code,
    });
  }

  useKeyPress("enter", () => {
    formApiRef.current?.submitForm();
  });

  return (
    <>
      <h3 className="text-18px text-primary font-medium">{t("page.login.codeLogin.title")}</h3>
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

        <Space vertical align="start" className="w-full" spacing={18}>
          <Button
            block
            htmlType="submit"
            loading={loading}
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

export const Route = createFileRoute("/(auth)/login/code-login/")({
  component: CodeLogin,
  staticData: {
    title: "code-login",
  },
});
