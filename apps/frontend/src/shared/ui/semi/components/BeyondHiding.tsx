import { Tooltip } from "@douyinfe/semi-ui";
import type { TooltipProps } from "@douyinfe/semi-ui/lib/es/tooltip";
import React, { useRef, useState } from "react";

type BeyondHidingProps = Omit<TooltipProps, "content" | "trigger" | "visible"> & {
  className?: string;
  style?: React.CSSProperties;
  title: React.ReactNode;
};

const BeyondHiding = ({ className, style, title, ...props }: BeyondHidingProps) => {
  const [isShow, setIsShow] = useState(false);

  const contentRef = useRef<HTMLSpanElement>(null);

  const isShowTooltip = (): void => {
    if (contentRef.current && contentRef.current.parentElement) {
      const spanWidth = contentRef.current.offsetWidth;
      const parentWidth = contentRef.current.parentElement.offsetWidth;

      if (spanWidth > parentWidth) {
        setIsShow(true);
      }
    }
  };
  return (
    <Tooltip content={title} trigger="custom" visible={isShow} {...props}>
      <span
        className={className}
        ref={contentRef}
        style={style}
        onMouseLeave={() => setIsShow(false)}
        onMouseOver={isShowTooltip}
      >
        {title}
      </span>
    </Tooltip>
  );
};

export default BeyondHiding;
