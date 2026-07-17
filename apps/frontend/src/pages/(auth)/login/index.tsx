import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, Space } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useKeyPress } from "ahooks";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useAuthFormRules } from "@/features/auth/use-auth-form-rules";
import { useInitLogin } from "@/features/auth/use-login";

type AccountKey = "admin" | "super" | "user";

interface Account {
  key: AccountKey;
  label: string;
  password: string;
  username: string;
}

type LoginParams = Pick<Account, "password" | "username">;

const INITIAL_VALUES: LoginParams = {
  password: "123456",
  username: "admin",
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formApiRef = useRef<FormApi<LoginParams> | null>(null);

  const { loading, login } = useInitLogin();

  const {
    formRules: { pwd, username: usernameRules },
  } = useAuthFormRules();

  const accounts: Account[] = [
    {
      key: "super",
      label: t("page.login.pwdLogin.superAdmin"),
      password: "123456",
      username: "Super",
    },
    {
      key: "admin",
      label: t("page.login.pwdLogin.admin"),
      password: "123456",
      username: "Admin",
    },
    {
      key: "user",
      label: t("page.login.pwdLogin.user"),
      password: "123456",
      username: "User",
    },
  ];

  function handleAccountLogin(account: Account) {
    void login({
      password: account.password,
      username: account.username,
    });
  }

  useKeyPress("enter", () => {
    formApiRef.current?.submitForm();
  });

  return (
    <>
      <h3 className="text-18px text-primary font-medium">{t("page.login.pwdLogin.title")}</h3>
      <Form
        className="pt-24px"
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        initValues={INITIAL_VALUES}
        onSubmit={(values) => void login(values)}
      >
        <Form.Input field="username" noLabel rules={usernameRules} size="large" />
        <Form.Input field="password" mode="password" noLabel rules={pwd} size="large" />

        <Space vertical align="start" className="w-full" spacing={24}>
          <div className="flex-y-center w-full justify-between">
            <Form.Checkbox field="remember" noLabel>
              {t("page.login.pwdLogin.rememberMe")}
            </Form.Checkbox>

            <Button
              theme="borderless"
              type="tertiary"
              onClick={() => void navigate({ to: "/login/reset-pwd" })}
            >
              {t("page.login.pwdLogin.forgetPassword")}
            </Button>
          </div>

          <Button
            block
            htmlType="submit"
            loading={loading}
            size="large"
            theme="solid"
            type="primary"
          >
            {t("page.login.pwdLogin.login")}
          </Button>

          <div className="flex-y-center w-full justify-between gap-12px">
            <Button
              block
              className="flex-1"
              size="large"
              theme="light"
              onClick={() => void navigate({ to: "/login/code-login" })}
            >
              {t("page.login.pwdLogin.codeLogin")}
            </Button>
            <Button
              block
              className="flex-1"
              size="large"
              theme="light"
              onClick={() => void navigate({ to: "/login/register" })}
            >
              {t("page.login.pwdLogin.register")}
            </Button>
          </div>

          <div className="w-full text-center text-14px text-#666">
            {t("page.login.pwdLogin.otherAccountLogin")}
          </div>

          <div className="flex-center gap-12px w-full">
            {accounts.map((item) => (
              <Button
                key={item.key}
                theme="solid"
                type="primary"
                onClick={() => handleAccountLogin(item)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Space>
      </Form>
    </>
  );
};

export const Route = createFileRoute("/(auth)/login/")({
  component: Login,
  staticData: {
    title: "login",
    i18nKey: "route.login",
  },
});
