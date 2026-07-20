import { Form, Modal, Spin, Tree } from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import { useEffect, useRef, useState } from "react";

import type { TableOperateType, TreeSelectOption } from "@/shared/web-ui-compose";
import type { RoleListItem } from "@/service/api/role";
import { roleApi } from "@/service/api/role/api";
import { usePermissionTreeQuery } from "@/service/api/permission/hooks";
import type { PermissionTreeNode } from "@/service/api/permission/types";
import { useDict } from "@/service/api/dict/hooks";

interface RoleOperateDrawerProps {
  /** 编辑时的当前行数据。 */
  editingData: RoleListItem | null;
  /** 关闭弹窗。 */
  onClose: () => void;
  /** 提交表单（新增/编辑）。 */
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  /** 操作类型。 */
  operateType: TableOperateType;
  /** 提交中（禁用确定按钮 loading）。 */
  submitting: boolean;
  /** 是否可见。 */
  visible: boolean;
}

function getParentKeys(nodes: PermissionTreeNode[]): Set<string> {
  const keys = new Set<string>();
  function walk(node: PermissionTreeNode) {
    if (node.children?.length) {
      keys.add(String(node.id));
      node.children.forEach(walk);
    }
  }
  nodes.forEach(walk);
  return keys;
}

function toPermissionTreeData(nodes: PermissionTreeNode[]): TreeSelectOption[] {
  return nodes.map((node) => ({
    key: String(node.id),
    label: node.name,
    value: node.id,
    children: node.children?.length ? toPermissionTreeData(node.children) : undefined,
  }));
}

const RoleOperateDrawer = ({
  editingData,
  onClose,
  onSubmit,
  operateType,
  submitting,
  visible,
}: RoleOperateDrawerProps) => {
  const { options: dataScopeOptions } = useDict("sys_data_scope");
  const formApiRef = useRef<FormApi | null>(null);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const { data: permissionTree } = usePermissionTreeQuery();
  const resolvedPermissionTree = permissionTree ?? [];
  const treeData = toPermissionTreeData(resolvedPermissionTree);

  // 过滤掉所有父级目录/菜单的 ID，只把叶子节点（子级）传给 Tree 的 value。
  // Tree 的经典级联选择（checkRelation="classic"）会自动根据叶子节点的勾选状态计算并呈现父级的勾选/半选状态。
  const parentKeys = getParentKeys(resolvedPermissionTree);
  const checkedLeafKeys = permissionIds.filter((id) => !parentKeys.has(id));

  useEffect(() => {
    if (!visible) return;

    const api = formApiRef.current;
    if (!api) return;

    if (operateType === "edit" && editingData) {
      if ((editingData as any).permissionIds) {
        api.setValues({
          name: editingData.name,
          code: editingData.code,
          description: editingData.description ?? "",
          dataScope: editingData.dataScope,
        });
        setPermissionIds(((editingData as any).permissionIds as number[]).map(String));
      } else {
        setLoadingDetail(true);
        roleApi
          .detail(editingData.id)
          .then((detail) => {
            api.setValues({
              name: detail.name,
              code: detail.code,
              description: detail.description ?? "",
              dataScope: detail.dataScope,
            });
            setPermissionIds((detail.permissionIds || []).map(String));
          })
          .catch(() => {
            api.setValues({
              name: editingData.name,
              code: editingData.code,
              description: editingData.description ?? "",
              dataScope: editingData.dataScope,
            });
          })
          .finally(() => {
            setLoadingDetail(false);
          });
      }
    } else {
      api.reset();
      api.setValue("dataScope", "self");
      setPermissionIds([]);
    }
  }, [visible, operateType, editingData]);

  async function handleOk() {
    const api = formApiRef.current;
    if (!api) return;

    const values = await api.validate();
    await onSubmit({
      ...values,
      permissionIds: permissionIds.map(Number),
    });
  }

  return (
    <Modal
      confirmLoading={submitting}
      title={operateType === "add" ? "新增角色" : "编辑角色"}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
    >
      <Spin spinning={loadingDetail}>
        <Form
          getFormApi={(api) => {
            formApiRef.current = api;
          }}
          labelPosition="top"
        >
          <Form.Input
            field="name"
            label="角色名称"
            placeholder="请输入角色名称"
            rules={[{ required: true, message: "请输入角色名称" }]}
          />

          <Form.Input
            field="code"
            label="角色编码"
            placeholder="请输入角色编码"
            rules={[{ required: true, message: "请输入角色编码" }]}
          />

          <Form.Select
            field="dataScope"
            label="数据范围"
            optionList={dataScopeOptions}
            placeholder="请选择数据范围"
            rules={[{ required: true, message: "请选择数据范围" }]}
            style={{ width: "100%" }}
          />

          <Form.TextArea field="description" label="备注" placeholder="请输入备注" />

          <div style={{ marginTop: 16 }}>
            <span style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>菜单权限</span>
            <div
              style={{
                border: "1px solid var(--semi-color-border)",
                borderRadius: 4,
                padding: "8px 12px",
                maxHeight: 250,
                overflowY: "auto",
              }}
            >
              <Tree
                multiple
                autoMergeValue={false}
                treeData={treeData}
                value={checkedLeafKeys}
                onChange={(val) => setPermissionIds((val as string[]) ?? [])}
              />
            </div>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleOperateDrawer;
