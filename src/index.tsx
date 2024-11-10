import React, {useCallback, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import classNames from "classnames";

function guid(len = 10) {
    len = len || 32
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz1234567890'
    const maxPos = chars.length
    let pwd = ''
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
}

const uid = guid(4).toLowerCase();

const FULL_MASK_ID = `FULL-MASK-${uid.toUpperCase()}`

const PREFIX_ID = `p-${uid}`

const MASK_ROOT = `data-root-${uid}`;

const STYLE_ID = `style-${uid}`

const CLASS_LATEST = `is-latest-${uid}`;

const STACK_CHANGE = `stack-change-${uid}`;

function getContent() {
    return document.querySelector(`#${FULL_MASK_ID}`)! || document.body;
}

function injectStyle(cssText: string) {
    const id = document.head.querySelector(`#${STYLE_ID}`);
    if (!id) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.innerHTML = cssText;
        document.head.appendChild(style)
    }
}

injectStyle(`
.${PREFIX_ID}-full {
  background: #F5F6FA;
  width: 100%;
  height: 100%;
  overflow: hidden;     
}
[${MASK_ROOT}] > *:not(.${CLASS_LATEST}) {
    width: 0 !important;
    height: 0 !important;
    overflow: hidden;
    margin: 0 !important;
    padding: 0 !important;
}
`)

export interface MaskProps {
    open?: boolean;
    children?: React.ReactNode;
    className?: string
}


let stack: string[] = [];
const evt = new EventTarget();

export type DefaultRender<P> = React.ReactElement | ((state: P, props: MaskProps) => React.ReactElement)

function useFullMask(): [
    React.ReactElement,
    React.Dispatch<React.SetStateAction<MaskProps>>,
    MaskProps
];

function useFullMask<P>(
    defaultRender: DefaultRender<P>,
    config?: Omit<MaskProps, "children">
): [
    React.ReactElement,
    React.Dispatch<React.SetStateAction<Partial<P> & MaskProps>>,
    MaskProps
];
/**全局的页面上的蒙层
 * useFullMask 自定义 Hook，用于管理遮罩层（Mask）的渲染和状态控制。
 *
 * 重载 1:
 * - 无参数调用时，提供基本的遮罩层元素、状态更新函数和初始的遮罩层属性。
 *
 * 重载 2:
 * - 可以通过 `defaultRender` 自定义遮罩层内容，并可选择性提供遮罩层的配置 `config`。
 *
 * @template P - 自定义渲染函数所需的属性类型。
 *
 * @param defaultRender - 自定义遮罩层渲染函数，接收类型 `P` 的参数，返回遮罩层内容的 React 元素。
 * @param config - 遮罩层的默认配置，类型为 `MaskProps`（不包括 `children` 属性）。
 *
 * @returns
 * - `[0]`: `React.ReactElement` - 遮罩层的 React 元素。
 * - `[1]`: `React.Dispatch<React.SetStateAction<P & MaskProps>>` - 设置遮罩层状态的函数。
 * - `[2]`: `MaskProps` - 遮罩层的当前属性配置。
 */
function useFullMask<S>(
    defaultRender?: DefaultRender<S>,
    config?: Omit<MaskProps, "children">
) {
    const idRef = useRef<string>(guid());
    const [props, setProps] = useState<MaskProps & { state?: S }>({
        open: false,
        ...config,
    });

    const [latest, setLatest] = useState<string>(stack[stack.length - 1]);
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
    const {open, state, ...rest} = props;
    const mask =
        content &&
        createPortal(
            open && (
                <div
                    ref={ref}
                    className={classNames(
                        `${PREFIX_ID}-full`,
                        props.className,
                        latest === idRef.current && CLASS_LATEST
                    )}
                >
                    {
                        props.children ||
                        defaultRender && (
                            typeof defaultRender === "function" ?
                                defaultRender(state!, {open, ...rest})
                                : React.cloneElement(defaultRender, {...rest, ...state})
                        )
                    }
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
            setProps((prevState) => {
                const _props = typeof stateAction == "function" ? stateAction(prevState) : {...prevState, ...stateAction};
                watchOpen(_props);
                return {..._props};
            });
        },
        [watchOpen]
    );

    useLayoutEffect(() => () => {
        watchOpen({open: false});
    }, [watchOpen]);

    return [mask, updateMaskProps, props] as [
        React.ReactElement,
        React.Dispatch<React.SetStateAction<MaskProps>>,
        MaskProps
    ];
}

export default useFullMask;