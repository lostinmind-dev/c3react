function createPanel() {
    const panel = document.createElement('div');
    panel.id = 'c3react-devtools';
    panel.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        font-family: monospace;
        z-index: 9999;
        overflow-y: auto;
        border-left: 2px solid limegreen;
        padding: 10px;
    `;

    const header = document.createElement('div');
    header.innerHTML = `<strong style="color: lime;">C3React DevTools</strong>`;
    panel.appendChild(header);

    const list = document.createElement('div');
    panel.appendChild(list);

    const render = async () => {
        const components = (await import('./component.ts')).components; // откуда берутся все Component
        // Или экспортировать `components` из самого Component.ts

        list.innerHTML = '';

        components.toArray().forEach((c, i) => {
            let state: string = '';
            try {
                state = JSON.stringify(c.getState());
            } catch (e) {

            }

            const div = document.createElement('div');
            div.style.marginBottom = '8px';
            div.style.padding = '4px';
            div.style.border = '1px solid #444';
            div.innerHTML = `
                <div><strong>${c.objectName}</strong> #${i}</div>
                <div style="font-size: 11px;">State: ${state}</div>
                <button data-idx="${i}" style="margin-top: 4px;">Log</button>
            `;

            div.querySelector('button')?.addEventListener('click', () => {
                console.log(c);
            });

            list.appendChild(div);
        });
    };

    setInterval(() => render(), 1000);
    // const refreshBtn = document.createElement('button');
    // refreshBtn.textContent = 'Refresh';
    // refreshBtn.onclick = render;
    // refreshBtn.style.marginTop = '10px';
    // panel.appendChild(refreshBtn);

    document.body.appendChild(panel);

    render();
}

export function initDevTools() {
    document.createElement('c3react-devtools');
    if (document.getElementById('c3react-devtools')) return;
    createPanel();
}


