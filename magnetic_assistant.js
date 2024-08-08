// ==UserScript==
// @name         磁力链接显示
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  解析磁力网站搜索后页面上的磁力链接，显示为表格，并提供复制按钮。
// @author       lyleOuO
// @downloadURL  https://github.com/lyleOuO/tampermonkey/blob/main/magnetic_assistant.js
// @license MIT
// @match        https://en.btdig.com/*
// @match        https://fzxuvyyi.clg167.buzz/*
// @match        https://javdb.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 从设置中获取容器的尺寸和背景透明度，设置默认值
    const containerWidth = GM_getValue('containerWidth', '500px');
    const containerHeight = GM_getValue('containerHeight', '200px');
    const containerBackground = GM_getValue('containerBackground', 'rgba(255, 255, 255, 1)'); // 不透明

    // 磁力链接的正则表达式
    const magnetRegex = /magnet:\?xt=urn:btih:([\w\d]{40})/gi;
    const links = document.querySelectorAll('a');
    const magnetLinks = Array.from(links)
        .map(link => link.href.match(magnetRegex))
        .flat()
        .filter(Boolean);

    // 创建并插入样式
    const style = document.createElement('style');
    style.textContent = `
        .container {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: ${containerBackground};
            border: 1px solid #ccc;
            padding: 10px;
            z-index: 9999;
            width: ${containerWidth};
            height: ${containerHeight};
            overflow-y: auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            cursor: move;
            font-family: Arial, sans-serif;
            font-size: 14px;
            display: flex;
            flex-direction: column;
        }
        .container table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ddd;
            margin: 0;
            border-spacing: 0;
        }
        .container td {
            padding: 5px;
            border-bottom: 1px solid #ddd;
        }
        .copy-button {
            padding: 5px 8px;
            font-size: 12px;
            background-color: red;
            color: white;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .copy-button:hover {
            background-color: #b30000;
        }
    `;
    document.head.appendChild(style);

    // 创建主容器
    const container = document.createElement('div');
    container.className = 'container';

    // 创建表格
    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    magnetLinks.forEach(link => {
        const row = document.createElement('tr');

        // 创建链接单元格
        const linkCell = document.createElement('td');
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.textContent = link;
        linkElement.target = '_blank';
        linkElement.style.textDecoration = 'none';
        linkElement.style.color = '#1e90ff';
        linkElement.style.wordBreak = 'break-all'; // 防止链接过长而溢出
        linkCell.appendChild(linkElement);
        row.appendChild(linkCell);

        // 创建复制按钮单元格
        const copyCell = document.createElement('td');
        const copyButton = document.createElement('button');
        copyButton.textContent = '复制';
        copyButton.className = 'copy-button';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(link)
                .then(() => {
                    copyButton.textContent = '已复制';
                    setTimeout(() => {
                        copyButton.textContent = '复制'; // 恢复原文本
                    }, 2000); // 2秒后恢复为“复制”
                })
                .catch(err => console.error('复制失败', err));
        };
        copyCell.appendChild(copyButton);
        row.appendChild(copyCell);

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
    table.appendChild(tableBody);
    container.appendChild(table);

    document.body.appendChild(container);

    // 实现拖动功能
    let isDragging = false;
    let offsetX, offsetY;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
        container.style.transition = 'none'; // 禁用过渡效果
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const containerRect = container.getBoundingClientRect();
            const maxX = window.innerWidth - containerRect.width;
            const maxY = window.innerHeight - containerRect.height;
            container.style.left = `${Math.min(Math.max(0, e.clientX - offsetX), maxX)}px`;
            container.style.top = `${Math.min(Math.max(0, e.clientY - offsetY), maxY)}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.transition = ''; // 恢复过渡效果
    });

    // 初始化容器位置
    container.style.left = GM_getValue('containerLeft', 'auto');
    container.style.top = GM_getValue('containerTop', 'auto');
})();
