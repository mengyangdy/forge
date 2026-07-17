import { Button, Popconfirm, Popover, Space } from "@douyinfe/semi-ui";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "clsx";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { SvgIcon } from "../components";

import type { SemiTableColumnCheck } from "./types";

interface SemiTableHeaderOperationProps {
  add?: () => Promise<void> | void;
  children?: ReactNode;
  columns: SemiTableColumnCheck[];
  deleteCount?: number;
  disabledDelete?: boolean;
  loading?: boolean;
  onDelete?: () => Promise<void> | void;
  prefix?: ReactNode;
  refresh: () => Promise<void> | void;
  setColumnChecks: (checks: SemiTableColumnCheck[]) => void;
  suffix?: ReactNode;
}

function sortColumns(cols: SemiTableColumnCheck[], refOrder: string[]) {
  const left = cols.filter((c) => c.fixed === "left");
  const unfixed = cols.filter((c) => c.fixed === "unFixed" || !c.fixed);
  const right = cols.filter((c) => c.fixed === "right");

  if (refOrder.length > 0) {
    const orderMap = new Map(refOrder.map((key, i) => [key, i]));
    left.sort((a, b) => (orderMap.get(a.key) ?? 0) - (orderMap.get(b.key) ?? 0));
    unfixed.sort((a, b) => (orderMap.get(a.key) ?? 0) - (orderMap.get(b.key) ?? 0));
    right.sort((a, b) => (orderMap.get(a.key) ?? 0) - (orderMap.get(b.key) ?? 0));
  }

  return [...left, ...unfixed, ...right];
}

interface SortableItemProps {
  id: string;
  col: SemiTableColumnCheck;
  toggleColumn: (key: string) => void;
  togglePin: (key: string) => void;
}

function SortableItem({ id, col, toggleColumn, togglePin }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 9999 : undefined,
  };

  const isPinned = col.fixed !== "unFixed";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "flex items-center gap-8px p-4px rounded-4px hover:bg-fill-0 select-none group",
        { "bg-fill-1 shadow-sm": isDragging },
      )}
    >
      <span
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center shrink-0"
      >
        <SvgIcon icon="mdi:drag" className="text-16px" />
      </span>
      <label className="flex cursor-pointer items-center gap-8px flex-1 min-w-0">
        <input
          checked={col.checked}
          className="cursor-pointer"
          type="checkbox"
          onChange={() => toggleColumn(col.key)}
        />
        <span className="truncate text-13px text-text-base">
          {typeof col.title === "function" ? col.key : col.title}
        </span>
      </label>
      <button
        className={classNames(
          "shrink-0 flex items-center justify-center p-2px rounded hover:bg-fill-1",
          {
            "text-primary hover:text-primary-hover": isPinned,
            "text-gray-300 hover:text-gray-600": !isPinned,
          },
        )}
        title={isPinned ? "取消固定" : "固定到右侧"}
        type="button"
        onClick={() => togglePin(col.key)}
      >
        <SvgIcon
          className="text-16px"
          icon={isPinned ? "material-symbols:keep" : "material-symbols:keep-outline"}
        />
      </button>
    </div>
  );
}

/** Semi 版表头操作栏：刷新 + 列显隐与拖拽排序。 */
const SemiTableHeaderOperation = (props: SemiTableHeaderOperationProps) => {
  const {
    add,
    children,
    columns,
    deleteCount,
    disabledDelete = false,
    loading = false,
    onDelete,
    prefix,
    refresh,
    setColumnChecks,
    suffix,
  } = props;

  const { t } = useTranslation();

  const originalKeysRef = useRef<string[]>([]);
  const customKeysOrderRef = useRef<string[]>([]);
  const initialColumnsRef = useRef<SemiTableColumnCheck[]>([]);

  useEffect(() => {
    if (columns.length > 0) {
      if (originalKeysRef.current.length === 0) {
        originalKeysRef.current = columns.map((c) => c.key);
      }
      if (customKeysOrderRef.current.length === 0) {
        customKeysOrderRef.current = columns.map((c) => c.key);
      }
      if (initialColumnsRef.current.length === 0) {
        initialColumnsRef.current = sortColumns(
          JSON.parse(JSON.stringify(columns)),
          originalKeysRef.current,
        );
      }
    }
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // 拖动 4px 才判定为拖拽，防止点击 checkbox 时误触发拖拽
      },
    }),
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.key === active.id);
      const newIndex = columns.findIndex((col) => col.key === over.id);
      const newCols = arrayMove(columns, oldIndex, newIndex);
      customKeysOrderRef.current = newCols.map((c) => c.key);
      setColumnChecks(sortColumns(newCols, customKeysOrderRef.current));
    }
  }

  function handleReset() {
    if (initialColumnsRef.current.length > 0) {
      customKeysOrderRef.current = [...originalKeysRef.current];
      setColumnChecks(JSON.parse(JSON.stringify(initialColumnsRef.current)));
    }
  }

  function toggleColumn(key: string) {
    const newCols = columns.map((col) =>
      col.key === key ? { ...col, checked: !col.checked } : col,
    );
    setColumnChecks(sortColumns(newCols, customKeysOrderRef.current));
  }

  function togglePin(key: string) {
    const newCols = columns.map((col) => {
      if (col.key !== key) return col;
      if (col.fixed !== "unFixed") {
        return { ...col, fixed: "unFixed" as const };
      }
      return { ...col, fixed: "right" as const };
    });
    setColumnChecks(sortColumns(newCols, customKeysOrderRef.current));
  }

  return (
    <Space wrap>
      {prefix}

      {children || (
        <>
          {add && (
            <Button
              icon={<SvgIcon className="text-icon" icon="ic:round-plus" />}
              size="small"
              theme="light"
              type="primary"
              onClick={add}
            >
              {t("common.add")}
            </Button>
          )}

          {onDelete && (
            <Popconfirm
              title={
                deleteCount ? `确认删除选中的 ${deleteCount} 项吗？` : t("common.confirmDelete")
              }
              onConfirm={onDelete}
            >
              <Button
                disabled={disabledDelete}
                icon={<SvgIcon className="text-icon" icon="ic:round-delete" />}
                size="small"
                theme="light"
                type="danger"
              >
                {t("common.batchDelete")}
              </Button>
            </Popconfirm>
          )}
        </>
      )}

      <Button
        icon={
          <SvgIcon
            className={classNames("text-icon", { "animate-spin": loading })}
            icon="mdi:refresh"
          />
        }
        size="small"
        onClick={refresh}
      >
        {t("common.refresh")}
      </Button>

      <Popover
        content={
          <div className="flex max-h-320px min-w-220px flex-col gap-6px overflow-hidden p-8px">
            {/* 顶部标题与重置 */}
            <div className="flex items-center justify-between px-4px pb-6px select-none shrink-0">
              <span className="text-13px font-600 text-text-base">列设置</span>
              <button
                className="text-12px text-primary hover:text-primary-hover font-500 cursor-pointer border-none bg-transparent p-0"
                type="button"
                onClick={handleReset}
              >
                重置
              </button>
            </div>
            {/* 分割线 */}
            <div className="h-1px bg-border-secondary shrink-0 mb-4px" />

            {/* 列表区 */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4px min-h-0">
              <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((col) => col.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <SortableItem
                        key={col.key}
                        col={col}
                        id={col.key}
                        toggleColumn={toggleColumn}
                        togglePin={togglePin}
                      />
                    ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        }
        position="bottomRight"
        trigger="click"
      >
        <Button icon={<SvgIcon icon="mdi:cog-outline" />} size="small">
          {t("common.columnSetting")}
        </Button>
      </Popover>

      {suffix}
    </Space>
  );
};

export default SemiTableHeaderOperation;
