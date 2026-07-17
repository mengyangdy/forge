import SvgIcon from "@/shared/ui/compose/components/SvgIcon";
import { useDebounceFn, useKeyPress } from "ahooks";
import { Button, Empty, Input, Modal, Space } from "@douyinfe/semi-ui";
import { IllustrationNoResult, IllustrationNoResultDark } from "@douyinfe/semi-illustrations";
import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAdminMenus } from "../../../state/menus/use-admin-menus";
import { useAdminState } from "../../../state/use-admin-state";

import SearchFooter from "./SearchFooter";
import SearchResult from "./SearchResult";

interface Props {
  /** 关闭搜索弹窗 */
  onClose: () => void;
  /** 是否显示搜索弹窗 */
  show: boolean;
}

/**
 * Transform menu to searchMenus
 *
 * @param menus - Menus
 * @param treeMap
 */
function transformMenuToSearchMenus(menus: Menu.CommonMenu[], treeMap: Menu.CommonMenu[] = []) {
  if (menus && menus.length === 0) return [];
  return menus.reduce((acc, cur) => {
    acc.push(cur);

    if (cur.children && cur.children.length > 0) {
      transformMenuToSearchMenus(cur.children, treeMap);
    }
    return acc;
  }, treeMap);
}

const SearchModal = (props: Props) => {
  const { onClose, show } = props;

  const [resultOptions, setResultOptions] = useState<Menu.CommonMenu[]>([]);

  const [activeRoute, setActiveRoute] = useState<string>("");
  const [keyword, setKeyword] = useState("");

  const { isMobile } = useAdminState();

  const { t } = useTranslation();

  const { menus, routerPushByKey } = useAdminMenus();

  const searchMenus = useMemo(() => transformMenuToSearchMenus(menus), [menus]);

  function getSearchText(menu: Menu.CommonMenu) {
    const i18nTitle = menu.i18nKey ? t(menu.i18nKey) : "";
    return `${menu.title ?? ""} ${i18nTitle}`.toLocaleLowerCase();
  }

  function handleClose() {
    setTimeout(() => {
      onClose();
      setKeyword("");
      setResultOptions([]);
    }, 200);
  }

  function search(nextKeyword = keyword) {
    const trimKeyword = nextKeyword.toLocaleLowerCase().trim();
    const result = searchMenus.filter(
      (menu) =>
        menu.type !== "divider" && (!trimKeyword || getSearchText(menu).includes(trimKeyword)),
    );

    const activeName = result[0]?.key || "";

    setResultOptions(result);

    setActiveRoute(activeName as unknown as string);
  }

  const handleSearch = useDebounceFn(search, { wait: 300 });

  // 打开弹窗时默认展示全部菜单，输入关键词后再过滤
  useEffect(() => {
    if (show) {
      search(keyword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, searchMenus]);

  function handleUp() {
    handleKeyPress(-1);
  }

  function handleDown() {
    handleKeyPress(1);
  }

  function getActivePathIndex() {
    return resultOptions.findIndex((item) => item.key === activeRoute);
  }

  function handleKeyPress(direction: 1 | -1) {
    const { length } = resultOptions;
    if (length === 0) return;

    const index = getActivePathIndex();
    if (index === -1) return;

    const activeIndex = (index + direction + length) % length;
    const activeKey = resultOptions[activeIndex].key;

    setActiveRoute(activeKey);
  }

  function handleEnter() {
    if (resultOptions.length === 0 || activeRoute === "") return;
    handleClose();
    routerPushByKey(activeRoute);
  }

  useKeyPress("Escape", handleClose);
  useKeyPress("Enter", handleEnter);
  useKeyPress("uparrow", handleUp);
  useKeyPress("downarrow", handleDown);

  return (
    <Modal
      bodyStyle={{ padding: 0 }}
      className={clsx({ "top-0px rounded-0": isMobile })}
      closable={false}
      footer={null}
      header={null}
      style={isMobile ? { margin: 0, maxWidth: "100%", padding: 0, top: 0 } : { top: "60px" }}
      visible={show}
      width={isMobile ? "100%" : 630}
      onCancel={handleClose}
    >
      <div className={clsx("flex flex-col", isMobile ? "h-100vh" : "h-400px")}>
        <div className="px-16px pt-16px">
          <Space className="w-full">
            <Input
              className="flex-1"
              placeholder={t("common.keywordSearch")}
              prefix={<SvgIcon className="text-15px text-#c2c2c2" icon="uil:search" />}
              showClear
              value={keyword}
              onChange={(value) => {
                setKeyword(value);
                handleSearch.run(value);
              }}
            />
            {isMobile && (
              <Button theme="light" type="primary" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
            )}
          </Space>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-16px py-8px">
          {resultOptions.length === 0 ? (
            <div className="h-full flex-center">
              <Empty
                darkModeImage={<IllustrationNoResultDark style={{ width: 120, height: 120 }} />}
                description={t("common.noData")}
                image={<IllustrationNoResult style={{ width: 120, height: 120 }} />}
              />
            </div>
          ) : (
            resultOptions.map((item) => (
              <SearchResult
                active={item.key === activeRoute}
                enter={handleEnter}
                key={item.key}
                menu={item}
                setActiveRouteName={setActiveRoute}
              />
            ))
          )}
        </div>

        {!isMobile && (
          <div className="px-16px">
            <SearchFooter />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SearchModal;
