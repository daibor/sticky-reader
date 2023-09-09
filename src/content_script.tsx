import React, { ReactNode, useEffect } from 'react';
import ReactDom from 'react-dom';
import { createRoot } from 'react-dom/client';
import { log } from './utils';

const portal = document.createElement('div');
portal.id = 'portal';
document.body.appendChild(portal);

const root = createRoot(portal);
root.render(<App />);

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
        if (commonAncestorContainerParent) {
            const target = commonAncestorContainerParent.cloneNode(true);
            const targetContainer = document.createElement('div');
            targetContainer.appendChild(target);
            targetContainer.style.position = 'sticky';
            targetContainer.style.top = '0';
            targetContainer.style.zIndex = '9999';
            targetContainer.style.backgroundColor = 'white';
            targetContainer.style.padding = '10px';
            targetContainer.style.borderRadius = '10px';
            targetContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            commonAncestorContainerParent.parentElement?.insertBefore(
                targetContainer,
                commonAncestorContainerParent,
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
