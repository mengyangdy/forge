import type { ClassValue } from "clsx";
import type { ElementType, ReactNode } from "react";

// Re-export shared cross-platform types from the local ui-types module
export type {
  AcceptableValue,
  ClassValue,
  MaybeArray,
  ThemeAlign,
  ThemeColor,
  ThemeOrientation,
  ThemeSide,
  ThemeSize,
  Value,
  WithClassName,
} from "@/shared/ui-types";

// ==================== Web-Specific Types ====================

/** HTML element tag types */
export type HTMLTag = ElementType;

/** Props for primitive components with polymorphic rendering */
export interface PrimitiveProps {
  /**
   * The element or component this component should render as. Can be overwritten by `asChild`
   *
   * @defaultValue 'div'
   */
  as?: HTMLTag;
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   *
   * Read our [Composition](https://www.forge-ui.com/docs/guides/composition) guide for more details.
   */
  asChild?: boolean;
}

/** Base props for styled components with className and size support */
export type StyledComponentProps<T> = Omit<T, "className"> & {
  /** CSS class name */
  className?: ClassValue;
  /** Component size variant */
  size?: import("@/shared/ui-types").ThemeSize;
};

/** Props for components with leading and trailing slots */
export interface SlotProps {
  /** Leading slot content */
  leading?: ReactNode;
  /** Trailing slot content */
  trailing?: ReactNode;
}

/** Props for HTML intrinsic elements with styling support */
export type HTMLComponentProps<T extends keyof React.JSX.IntrinsicElements> = StyledComponentProps<
  React.ComponentPropsWithRef<T>
>;
