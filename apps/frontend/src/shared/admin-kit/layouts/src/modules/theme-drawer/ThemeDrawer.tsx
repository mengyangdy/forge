import ScrollArea from "@/shared/ui/primitives/preset/scroll-area/ScrollArea";
import { SideSheet, Tabs, TabPane } from "@douyinfe/semi-ui";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { themeTabsOptions, translateOptions } from "../../options";
import { useAdminState } from "../../state/use-admin-state";

import Appearance from "./modules/appearance";
import ConfigOperation from "./modules/ConfigOperation";
import ThemeGeneral from "./modules/general/ThemeGeneral";
import ThemeLayout from "./modules/layout/ThemeLayout";
import ThemePreset from "./modules/preset/ThemePreset";

const ThemeDrawer = () => {
  const { closeThemeDrawer, themeDrawerVisible } = useAdminState();

  const { t } = useTranslation();

  const options = translateOptions(themeTabsOptions);

  const [activeTab, setActiveTab] = useState<string>(options[0].value);

  return (
    <SideSheet
      bodyStyle={{ padding: 0 }}
      footer={<ConfigOperation />}
      headerStyle={{ borderBottom: "1px solid var(--semi-color-border)" }}
      title={t("theme.themeDrawerTitle")}
      visible={themeDrawerVisible}
      width={360}
      onCancel={closeThemeDrawer}
    >
      <ScrollArea className="h-full">
        <div className="min-h-400px overflow-x-hidden px-24px pb-24px pt-8px">
          <Tabs
            activeKey={activeTab}
            className="mb-16px"
            type="button"
            onChange={(key) => setActiveTab(String(key))}
          >
            {options.map((opt) => (
              <TabPane itemKey={opt.value} key={opt.value} tab={opt.label} />
            ))}
          </Tabs>

          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              initial={{ opacity: 0, x: 10 }}
              key={activeTab}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {activeTab === options[0].value && <Appearance />}
              {activeTab === options[1].value && <ThemeLayout />}
              {activeTab === options[2].value && <ThemeGeneral />}
              {activeTab === options[3].value && <ThemePreset />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
    </SideSheet>
  );
};

export default ThemeDrawer;
