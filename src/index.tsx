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

function style(cssText: string) {
    const id = document.head.querySelector(`#${STYLE_ID}`);
    if (!id) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.innerHTML = cssText;
        document.head.appendChild(style)
    }
}

style(`
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


function getContent() {
    return document.querySelector(`#${FULL_MASK_ID}`)! || document.body;
}

let stack: string[] = [];
const evt = new EventTarget();

type DefaultRender<P> = React.ReactElement | ((state: P | undefined, props: MaskProps) => React.ReactElement)

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
    React.Dispatch<React.SetStateAction<P & MaskProps>>,
    MaskProps
];

/**
 * 全局的页面上的蒙层
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
                                defaultRender(state, {open, ...rest})
                                : React.cloneElement(defaultRender, {...rest})
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
            if (typeof stateAction == "function") {
                setProps((prevState) => {
                    const _props = stateAction(prevState);
                    watchOpen(_props);
                    return {..._props};
                });
            } else {
                watchOpen({...props, ...stateAction});
                setProps({...props, ...stateAction});
            }
        },
        []
    );

    useLayoutEffect(() => {
        return () => {
            watchOpen({open: false});
        };
    }, []);

    return [mask, updateMaskProps, props] as [
        React.ReactElement,
        React.Dispatch<React.SetStateAction<MaskProps>>,
        MaskProps
    ];
}

export default useFullMask;