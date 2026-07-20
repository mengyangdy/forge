import { Button, Form, Input, Modal, Toast } from "@douyinfe/semi-ui";
import { Icon } from "@iconify/react";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef, useState } from "react";

import type { TableOperateType, TreeSelectOption } from "@/shared/web-ui-compose";
import { useDict } from "@/service/api/dict/hooks";

interface MenuEditingData {
  code?: string | null;
  component?: string | null;
  i18nKey?: string | null;
  icon?: string | null;
  iconType?: string | null;
  id: number;
  name: string;
  order?: number | null;
  parentId?: number | null;
  pathParam?: string | null;
  routeName?: string | null;
  routePath?: string | null;
  status?: string | null;
  type: string;
}

export interface MenuItemEditProps {
  /** 编辑时的当前行数据。 */
  editingData: MenuEditingData | null;
  /** 上级菜单树数据。 */
  menuTreeData?: TreeSelectOption[];
  /** 关闭弹窗。 */
  onClose: () => void;
  /** 提交表单（新增/编辑）。 */
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  /** 操作类型。 */
  operateType: TableOperateType;
  /** 新增下级时预设的上级权限 id（新增顶级为 null）。 */
  presetParentId?: number | null;
  /** 提交中（禁用确定按钮 loading）。 */
  submitting: boolean;
  /** 是否可见。 */
  visible: boolean;
}

const iconTypeOptions = [
  { label: "Iconify", value: "iconify" },
  { label: "本地", value: "local" },
];

/** 编辑时禁用「自身及其子孙」作为上级，避免形成环。 */
function disableSelfSubtree(nodes: TreeSelectOption[], disabledId: number): TreeSelectOption[] {
  return nodes.map((node) => {
    const isSelf = node.value === disabledId;
    // oxlint-disable-next-line no-nested-ternary
    const children = node.children
      ? isSelf
        ? node.children.map((child) => markAllDisabled(child))
        : disableSelfSubtree(node.children, disabledId)
      : undefined;
    return {
      ...node,
      disabled: isSelf,
      children,
    };
  });
}

function markAllDisabled(node: TreeSelectOption): TreeSelectOption {
  return {
    ...node,
    disabled: true,
    children: node.children?.map((child) => markAllDisabled(child)),
  };
}

const MenuItemEdit = ({
  editingData,
  menuTreeData = [],
  onClose,
  onSubmit,
  operateType,
  presetParentId = null,
  submitting,
  visible,
}: MenuItemEditProps) => {
  const { options: allTypeOptions } = useDict("sys_permission_type");
  const typeOptions = allTypeOptions.filter((opt) => opt.value !== "button");
  const { options: statusOptions } = useDict("sys_status");

  const formApiRef = useRef<FormApi | null>(null);
  const [menuType, setMenuType] = useState<string>("menu");
  const [buttons, setButtons] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      setMenuType(editingData.type);
      setButtons([]);
      api.setValues({
        type: editingData.type,
        name: editingData.name,
        code: editingData.code,
        parentId: editingData.parentId ?? undefined,
        routeName: editingData.routeName ?? "",
        routePath: editingData.routePath ?? "",
        component: editingData.component ?? "",
        pathParam: editingData.pathParam ?? "",
        i18nKey: editingData.i18nKey ?? "",
        order: editingData.order ?? 0,
        iconType: editingData.iconType ?? "iconify",
        icon: editingData.icon ?? "",
        status: editingData.status ?? "active",
      });
    } else {
      setMenuType("menu");
      setButtons([]);
      api.reset();
      api.setValues({
        type: "menu",
        status: "active",
        iconType: "iconify",
        order: 0,
        parentId: presetParentId ?? undefined,
      });
    }
  }, [visible, operateType, editingData, presetParentId]);

  const treeData =
    operateType === "edit" && editingData
      ? disableSelfSubtree(menuTreeData, editingData.id)
      : menuTreeData;

  const handleAddBtn = () => {
    setButtons([...buttons, { name: "", code: "" }]);
  };

  const handleRemoveBtn = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleBtnChange = (index: number, key: "code" | "name", val: string) => {
    const newBtns = [...buttons];
    newBtns[index][key] = val;
    setButtons(newBtns);
  };

  async function handleOk() {
    const api = formApiRef.current;
    if (!api) return;

    const values = await api.validate();

    // 校验动态新增的按钮是否填写完整
    for (const btn of buttons) {
      if (!btn.name.trim() || !btn.code.trim()) {
        Toast.error("请完整填写所有新增按钮的描述和编码");
        return;
      }
    }

    await onSubmit({ ...values, buttons });
  }

  return (
    <Modal
      confirmLoading={submitting}
      title={operateType === "add" ? "新增菜单/权限" : "编辑菜单/权限"}
      visible={visible}
      width={640}
      onCancel={onClose}
      onOk={handleOk}
    >
      <Form
        getFormApi={(api) => {
          formApiRef.current = api;
        }}
        labelPosition="top"
        onValueChange={(values) => {
          if (values.type && values.type !== menuType) {
            setMenuType(values.type);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-x-16px">
          <Form.RadioGroup
            field="type"
            label="菜单类型"
            options={typeOptions}
            rules={[{ required: true, message: "请选择类型" }]}
          />

          <Form.Input
            field="name"
            label="菜单名称"
            placeholder="请输入名称"
            rules={[{ required: true, message: "请输入名称" }]}
          />

          {(menuType === "button" || menuType === "api") && (
            <Form.Input
              field="code"
              label="权限编码"
              placeholder="请输入权限编码"
              rules={[{ required: true, message: "请输入权限编码" }]}
            />
          )}
          <Form.TreeSelect
            field="parentId"
            filterTreeNode
            label="上级菜单"
            placeholder="不选则为顶级"
            showClear
            style={{ width: "100%" }}
            treeData={treeData}
          />

          {(menuType === "menu" || menuType === "catalogue") && (
            <>
              <Form.Input
                field="routeName"
                label="路由名称"
                placeholder="请输入路由名称 (例如: system_menu)"
                rules={[{ required: true, message: "请输入路由名称" }]}
              />

              <Form.Input
                field="routePath"
                label="路由路径"
                placeholder="请输入路由路径 (例如: /system/menu)"
                rules={[{ required: true, message: "请输入路由路径" }]}
              />
            </>
          )}

          {menuType === "menu" && (
            <>
              <Form.Input
                field="component"
                label="组件路径"
                placeholder="请输入页面组件路径 (例如: /system/menu/index)"
              />

              <Form.Input
                field="pathParam"
                label="路径参数"
                placeholder="请输入路径参数 (例如: :id)"
              />
            </>
          )}

          {(menuType === "menu" || menuType === "catalogue") && (
            <>
              <Form.Input field="i18nKey" label="国际化 key" placeholder="请输入国际化 key" />

              <Form.RadioGroup field="iconType" label="图标类型" options={iconTypeOptions} />

              <Form.Input field="icon" label="图标" placeholder="请输入图标类名 (例如: mdi:menu)" />
            </>
          )}

          <Form.InputNumber
            field="order"
            label="排序"
            placeholder="请输入排序值"
            rules={[{ required: true, message: "请输入排序" }]}
          />

          <Form.RadioGroup
            field="status"
            label="菜单状态"
            options={statusOptions}
            rules={[{ required: true, message: "请选择状态" }]}
          />

          {menuType === "menu" && operateType === "add" && (
            <div style={{ gridColumn: "span 2", marginTop: "16px", marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "80px",
                    paddingTop: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--semi-color-text-1)",
                    textAlign: "right",
                  }}
                >
                  按钮
                </div>
                <div style={{ flex: 1 }}>
                  {buttons.length === 0 ? (
                    <div
                      onClick={handleAddBtn}
                      style={{
                        border: "1px dashed var(--semi-color-border)",
                        borderRadius: "6px",
                        height: "38px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "var(--semi-color-text-2)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--semi-color-primary)";
                        e.currentTarget.style.color = "var(--semi-color-primary)";
                        e.currentTarget.style.backgroundColor =
                          "var(--semi-color-primary-light-default)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--semi-color-border)";
                        e.currentTarget.style.color = "var(--semi-color-text-2)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <Icon icon="lucide:plus" style={{ marginRight: "4px" }} /> 添加
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {buttons.map((btn, index) => (
                        <div
                          key={index}
                          style={{ display: "flex", gap: "12px", alignItems: "center" }}
                        >
                          <Input
                            value={btn.code}
                            placeholder="请输入按钮编码"
                            onChange={(val) => handleBtnChange(index, "code", val)}
                            style={{ width: "200px" }}
                          />
                          <Input
                            value={btn.name}
                            placeholder="请输入按钮描述"
                            onChange={(val) => handleBtnChange(index, "name", val)}
                            style={{ width: "220px" }}
                          />
                          <Button
                            theme="light"
                            type="primary"
                            icon={<Icon icon="lucide:plus" />}
                            onClick={handleAddBtn}
                            style={{
                              border: "1px solid var(--semi-color-primary-light-default)",
                              color: "var(--semi-color-primary)",
                            }}
                          />
                          <Button
                            theme="light"
                            type="danger"
                            icon={<Icon icon="lucide:minus" />}
                            onClick={() => handleRemoveBtn(index)}
                            style={{
                              border: "1px solid var(--semi-color-danger-light-default)",
                              color: "var(--semi-color-danger)",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default MenuItemEdit;
