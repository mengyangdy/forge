import { createLink } from "@tanstack/react-router";
import type { LinkComponent, LinkComponentProps } from "@tanstack/react-router";
import { Button } from "@douyinfe/semi-ui";
import type { ButtonProps } from "@douyinfe/semi-ui/lib/es/button";
import type { Ref } from "react";

interface ButtonLinkProps extends Omit<ButtonProps, "theme" | "type"> {
  ref?: Ref<HTMLAnchorElement>;
}

const ButtonLinkComponent = (props: ButtonLinkProps) => {
  const { ref, ...rest } = props;

  return <Button theme="borderless" type="tertiary" {...rest} ref={ref as never} />;
};

export type ButtonLinkComponentProps = LinkComponentProps<typeof ButtonLinkComponent>;

const CreatedButtonLinkComponent = createLink(ButtonLinkComponent);

const ButtonLink: LinkComponent<typeof ButtonLinkComponent> = (props) => {
  return <CreatedButtonLinkComponent preload="intent" {...props} />;
};

export default ButtonLink;
