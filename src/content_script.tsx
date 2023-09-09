import React, { ReactNode, useEffect } from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import { log } from './utils';

const portal = document.createElement('div');
portal.id = 'portal';
document.body.appendChild(portal);

const root = createRoot(portal);
root.render(<App />);

function isScrollable(element: HTMLElement) {
    // Check both vertical and horizontal overflow properties
    const style = window.getComputedStyle(element);
    const isOverflowScrollY = style.overflowY === 'auto' || style.overflowY === 'scroll';
    const isOverflowScrollX = style.overflowX === 'auto' || style.overflowX === 'scroll';

    // For the root scrollable element (window/document/body)
    const hasScrollableSpaceY = element.scrollHeight > element.clientHeight;
    const hasScrollableSpaceX = element.scrollWidth > element.clientWidth;

    return (isOverflowScrollY && hasScrollableSpaceY) || (isOverflowScrollX && hasScrollableSpaceX);
  }


function App() {
    const [target, setTarget] = React.useState<React.ReactPortal[]>([]);

    function getCollapsedRange(range: Range) {
        const {
            commonAncestorContainer,
            startContainer,
            endContainer,
            startOffset,
            endOffset,
        } = range;

        // if (commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {

        let commonAncestorContainerParent =
            commonAncestorContainer.parentElement;
        while (
            commonAncestorContainerParent?.nodeType !== Node.ELEMENT_NODE &&
            commonAncestorContainerParent &&
            commonAncestorContainerParent.parentElement
        ) {
            commonAncestorContainerParent =
                commonAncestorContainerParent?.parentElement;
        }
        console.log(
            'commonAncestorContainer',
            commonAncestorContainer,
            commonAncestorContainerParent,
        );
        let commonAncestorScrollableParent =
            commonAncestorContainer.parentElement;
        while (
            commonAncestorScrollableParent &&
            !isScrollable(commonAncestorScrollableParent) &&
            commonAncestorScrollableParent.parentElement
        ) {
            commonAncestorScrollableParent =
                commonAncestorScrollableParent?.parentElement;
        }
        console.log('most recent scrollable parent', commonAncestorScrollableParent)
        if (commonAncestorContainerParent) {
            const target = commonAncestorContainer.cloneNode(true);
            const targetContainer = document.createElement('div');
            targetContainer.appendChild(target);
            targetContainer.style.position = 'sticky';
            targetContainer.style.top = '0';
            targetContainer.style.zIndex = '9999';
            targetContainer.style.backgroundColor = 'white';
            targetContainer.style.padding = '10px';
            targetContainer.style.borderRadius = '10px';
            targetContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            // TODO: 需要检查父节点是不是真正撑开滚动容器的那个子节点，如果插入错误的子节点，会被后面的子节点推走了
            commonAncestorContainer.parentElement?.insertBefore(
                targetContainer,
                commonAncestorContainer.nextSibling,
            );
        }

        // const el = ReactDom.createPortal(
        //     <div style={{ position: 'sticky', top: 0 }}>{target as ReactNode}</div>,
        //     document.body,
        // );

        // setTarget((i) => [...i, el]);
        // }

        // if (target) {
        //     commonAncestorContainer.parentElement?.appendChild(target);

        //     console.log(
        //         'append',
        //         target,
        //         commonAncestorContainer.parentElement,
        //     );
        //     target.style.position = 'sticky';
        //     target.style.top = '0';
        // }
    }
    useEffect(() => {
        document.onmouseup = function () {
            const selection = window?.getSelection();

            const selectedText = selection?.toString();

            if (!selection) {
                return;
            }

            console.log(selection);

            for (var i = 0; i < selection.rangeCount; i++) {
                console.log(selection.getRangeAt(i));
                if (!selection.getRangeAt(i).collapsed) {
                    const range = selection.getRangeAt(i);
                    console.log('collapsed', range);
                    getCollapsedRange(range);
                }
            }
        };
    }, []);
    return <div></div>;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});
