import { Button, Col, Form, Row } from "@douyinfe/semi-ui";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { SvgIcon } from "../components";

import type { SemiSearchFormProps } from "./types";

const TOTAL_SPAN = 24;

/**
 * Semi 版搜索表单。
 *
 * 字段用 Form.Input / Form.Select 等（带 field），或 Form.Slot + 自定义控件。
 */
function SemiSearchForm<T extends Record<string, any> = Record<string, any>>(
  props: SemiSearchFormProps<T>,
) {
  const {
    children,
    colSpan = 6,
    defaultCollapsedCount = 3,
    getFormApi,
    initValues,
    reset,
    resetText = "重置",
    search,
    searchParams,
    searchText = "查询",
  } = props;

  const [collapsed, setCollapsed] = useState(true);

  const childrenArray = useMemo(() => Array.from(asArray(children)), [children]);
  const totalCount = childrenArray.length;
  const showToggle = totalCount > defaultCollapsedCount;
  const firstRowChildren = childrenArray.slice(0, defaultCollapsedCount);
  const extraChildren = childrenArray.slice(defaultCollapsedCount);
  const operationOffset = Math.max(0, TOTAL_SPAN - colSpan - firstRowChildren.length * colSpan);

  async function handleSearch() {
    await search();
  }

  return (
    <Form
      className="m-0 semi-search-form"
      getFormApi={getFormApi}
      initValues={(initValues ?? searchParams) as T | undefined}
      labelPosition="left"
      labelWidth={80}
      layout="horizontal"
    >
      <Row gutter={[16, 16]}>
        {firstRowChildren.map((child, index) => (
          <Col key={`field-${index}`} lg={colSpan} md={12} span={24}>
            {child}
          </Col>
        ))}

        <Col lg={{ offset: operationOffset, span: colSpan }} md={12} span={24}>
          <div className="flex flex-justify-end flex-wrap items-center gap-8px">
            <Button icon={<SvgIcon icon="ic:round-refresh" />} theme="light" onClick={reset}>
              {resetText}
            </Button>
            <Button
              icon={<SvgIcon icon="ic:round-search" />}
              theme="solid"
              type="primary"
              onClick={handleSearch}
            >
              {searchText}
            </Button>
            {showToggle && (
              <Button theme="borderless" type="primary" onClick={() => setCollapsed((v) => !v)}>
                {collapsed ? "展开" : "收起"}
                <SvgIcon
                  icon="mdi:chevron-down"
                  style={{
                    marginLeft: 4,
                    transition: "transform 0.2s",
                    transform: collapsed ? "none" : "rotate(180deg)",
                  }}
                />
              </Button>
            )}
          </div>
        </Col>

        {!collapsed &&
          extraChildren.map((child, index) => (
            <Col key={`extra-${index}`} lg={colSpan} md={12} span={24}>
              {child}
            </Col>
          ))}
      </Row>
    </Form>
  );
}

function asArray(children: ReactNode): ReactNode[] {
  if (Array.isArray(children)) return children;
  return children == null || children === false ? [] : [children];
}

export default SemiSearchForm;
