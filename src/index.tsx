import React, { useCallback, useLayoutEffect, useRef } from "react";
import { useSafeState } from "ahooks";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { guid } from "@/utils";
import { FULL_MASK_ID } from "@/constant";
import styles from "./index.module.less";

export interface MaskProps {
  open?: boolean;
  children?: React.ReactNode;
}

const MASK_ROOT = "data-mask-root";
const STACK_CHANGE = "stack-change";

function getContent() {
  return document.querySelector(`#${FULL_MASK_ID}`)! as HTMLElement;
}

let stack: string[] = [];
const evt = new EventTarget();

function useFullMask(): [
  React.ReactElement,
  React.Dispatch<React.SetStateAction<MaskProps>>,
  MaskProps
];

function useFullMask<P>(
  jsx: React.ReactElement,
  config?: Omit<MaskProps, "children">
): [
  React.ReactElement,
  React.Dispatch<React.SetStateAction<P & MaskProps>>,
  MaskProps
];

/**
 * 全局的页面上的蒙层
 */
function useFullMask(
  jsx?: React.ReactElement,
  config?: Omit<MaskProps, "children">
) {
  const idRef = useRef<string>(guid());
  const [props, setProps] = useSafeState<MaskProps>({
    open: false,
    ...config,
  });

  const [latest, setLatest] = useSafeState<string>(stack[stack.length - 1]);
  const content = getContent();

  useLayoutEffect(() => {
    const onStackChange = () => {
      setLatest(stack[stack.length - 1]);
      stack.length !== 0
        ? content.setAttribute(MASK_ROOT, "true")
        : content.removeAttribute(MASK_ROOT);
    };
    evt.addEventListener(STACK_CHANGE, onStackChange);
    return () => {
      evt.removeEventListener(STACK_CHANGE, onStackChange);
    };
  }, []);

  const ref = React.useRef<HTMLDivElement>(null);
  const { open, ...rest } = props;
  const mask =
    content &&
    createPortal(
      open && (
        <div
          ref={ref}
          className={classNames(
            styles.full,
            latest === idRef.current && "mask-is-latest"
          )}
        >
          {jsx ? React.cloneElement(jsx, { ...rest }) : props.children}
        </div>
      ),
      content
    );

  //通知其他实例改变
  const watchOpen = useCallback((props: MaskProps) => {
    if (props.open) {
      stack.push(idRef.current);
    } else {
      stack = stack.filter((it) => it !== idRef.current);
    }
    evt.dispatchEvent(new CustomEvent(STACK_CHANGE, {}));
  }, []);

  const updateMaskProps = useCallback(
    (stateAction: React.SetStateAction<MaskProps>) => {
      if (typeof stateAction == "function") {
        setProps((prevState) => {
          const _props = stateAction(prevState);
          watchOpen(_props);
          return { ..._props };
        });
      } else {
        watchOpen({ ...props, ...stateAction });
        setProps({ ...props, ...stateAction });
      }
    },
    []
  );

  useLayoutEffect(() => {
    return () => {
      watchOpen({ open: false });
    };
  }, []);

  return [mask, updateMaskProps, props] as [
    React.ReactElement,
    React.Dispatch<React.SetStateAction<MaskProps>>,
    MaskProps
  ];
}

export default useFullMask;
