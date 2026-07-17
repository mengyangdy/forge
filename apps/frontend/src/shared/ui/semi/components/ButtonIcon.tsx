// oxlint-disable import/no-unassigned-import
import { Button, Tooltip } from "@douyinfe/semi-ui";
import type { ButtonProps } from "@douyinfe/semi-ui/lib/es/button";
import type { TooltipProps } from "@douyinfe/semi-ui/lib/es/tooltip";
import { clsx } from "clsx";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

import { SvgIcon } from "../../compose";
import type { ButtonLinkComponentProps } from "./ButtonLink";
import ButtonLink from "./ButtonLink";
import "./styles/button-icon-animations.css";

/** Icon hover animation types */
export type IconHoverAnimation =
  | "bounce"
  | "flip"
  | "pulse"
  | "rotate"
  | "scale"
  | "shake"
  | "spin"
  | "swing"
  | "tada"
  | "wiggle";

type BaseProps = {
  children?: ReactNode;
  /** Button class */
  className?: string;
  /** Tooltip class names */
  classNames?: {
    button?: string;
    icon?: string;
  };
  /** Icon hover animation effect */
  hoverAnimation?: IconHoverAnimation;
  /** Iconify icon name */
  icon?: string;
  styles?: {
    button?: CSSProperties;
    icon?: CSSProperties;
  };
  /** Tooltip content */
  tooltipContent?: string;
  /** Tooltip placement */
  tooltipPlacement?: TooltipProps["position"];
  /** Tooltip props */
  tooltipProps?: Omit<TooltipProps, "children" | "content" | "getPopupContainer" | "position">;
  /** Z-index */
  zIndex?: number;
};

type WithButtonProps = Omit<ButtonProps, "icon" | "theme" | "type"> &
  BaseProps & {
    onClick?: MouseEventHandler<HTMLButtonElement>;
  };

type WithLinkProps = Partial<Omit<ButtonLinkComponentProps, "icon">> & BaseProps;

export type ButtonIconProps = WithButtonProps | WithLinkProps;

/** - 动态计算class */
const computeClass = (className: string) => {
  let clsStr = className;

  if (!clsStr.includes("h-")) {
    clsStr += " h-2xl";
  }

  if (!clsStr.includes("text-")) {
    clsStr += " text-lg";
  }

  return clsStr;
};

const ButtonIcon = ({
  children,
  className = "h-2xl text-lg",
  classNames,
  hoverAnimation,
  icon,
  styles,
  tooltipContent,
  tooltipPlacement = "bottom",
  tooltipProps,
  zIndex = 98,
  ...rest
}: ButtonIconProps) => {
  const cls = computeClass(className);

  const isLink = "to" in rest;
  const animationClass = hoverAnimation ? `btn-icon-hover-${hoverAnimation}` : "";

  const inner = (
    <div className={clsx("flex-center gap-8px", animationClass)}>
      {children || <SvgIcon className={classNames?.icon} icon={icon} style={styles?.icon} />}
    </div>
  );

  const trigger = isLink ? (
    <ButtonLink className={clsx(cls, classNames?.button)} style={styles?.button} {...rest}>
      {inner}
    </ButtonLink>
  ) : (
    <Button
      className={clsx(cls, classNames?.button)}
      style={styles?.button}
      theme="borderless"
      type="tertiary"
      {...(rest as WithButtonProps)}
    >
      {inner}
    </Button>
  );

  if (!tooltipContent) {
    return trigger;
  }

  return (
    <Tooltip content={tooltipContent} position={tooltipPlacement} zIndex={zIndex} {...tooltipProps}>
      {trigger}
    </Tooltip>
  );
};
export default ButtonIcon;
