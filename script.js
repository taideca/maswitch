document.addEventListener('DOMContentLoaded', () => {

    // --- HTML要素の取得 ---
    const gridContainer = document.getElementById('grid-container');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    
    // パネル要素
    const panels = {
        swap: document.getElementById('swap-panel'),
        edit: document.getElementById('edit-panel'),
        search: document.getElementById('search-panel')
    };
    
    // 編集パネルの要素
    const textInput = document.getElementById('text-input');
    const updateTextBtn = document.getElementById('update-text-btn');
    const imageInput = document.getElementById('image-input');
    const colorInput = document.getElementById('color-input');
    const saveIdInput = document.getElementById('save-id-input');
    const saveBtn = document.getElementById('save-btn');

    // 検索パネルの要素
    const loadIdInput = document.getElementById('load-id-input');
    const loadBtn = document.getElementById('load-btn');
    
    let cells = []; // マス要素を格納する配列

    // --- 状態を管理する変数 ---
    let highlightedCell = null;
    let editingCell = null;
    let currentMode = 'swap';

    // --- 初期化処理 ---
    function initializeGrid() {
        gridContainer.innerHTML = ''; // グリッドをクリア
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.dataset.index = i; // インデックス番号をデータとして保持
            cell.textContent = i + 1;
            gridContainer.appendChild(cell);

            // クリックイベントを追加
            cell.addEventListener('click', onCellClick);
        }
        cells = document.querySelectorAll('.grid-item'); // マス要素を再取得
    }

    // --- イベントリスナーの設定 ---

    // モード切替
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentMode = event.target.value;
            updatePanelVisibility();
            resetSelections();
        });
    });

    // テキスト更新ボタン
    updateTextBtn.addEventListener('click', () => {
        if (editingCell && textInput.value) {
            editingCell.innerHTML = '';
            editingCell.textContent = textInput.value;
        } else if (!editingCell) {
            alert('編集したいマスを先にクリックしてください！');
        }
    });

    // 画像選択
    imageInput.addEventListener('change', (event) => {
        if (editingCell) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                editingCell.innerHTML = `<img src="${e.target.result}" alt="user image">`;
            };
            reader.readAsDataURL(file);
        } else {
            alert('画像をセットしたいマスを先にクリックしてください！');
            imageInput.value = '';
        }
    });

    // カラーピッカー
    colorInput.addEventListener('input', () => {
        if (editingCell) {
            editingCell.style.backgroundColor = colorInput.value;
        }
    });

    // 保存ボタン
    saveBtn.addEventListener('click', () => {
        const saveId = saveIdInput.value.trim();
        if (!saveId) {
            alert('保存IDを入力してください。');
            return;
        }
        
        const gridData = [];
        cells.forEach(cell => {
            gridData.push({
                content: cell.innerHTML,
                color: cell.style.backgroundColor
            });
        });

        // localStorageから既存のデータを取得
        const allPuzzles = JSON.parse(localStorage.getItem('puzzleSets')) || {};
        // 新しいデータを追加
        allPuzzles[saveId] = gridData;
        // localStorageに保存
        localStorage.setItem('puzzleSets', JSON.stringify(allPuzzles));

        alert(`ID:「${saveId}」で盤面を保存しました。`);
    });

    // 読込ボタン
    loadBtn.addEventListener('click', () => {
        const loadId = loadIdInput.value.trim();
        if (!loadId) {
            alert('読込IDを入力してください。');
            return;
        }

        const allPuzzles = JSON.parse(localStorage.getItem('puzzleSets')) || {};
        const puzzleData = allPuzzles[loadId];

        if (puzzleData) {
            applyGridData(puzzleData);
            alert(`ID:「${loadId}」の盤面を読み込みました。`);
        } else {
            alert(`ID:「${loadId}」のデータが見つかりません。`);
        }
    });

    // --- 主要な関数 ---

    // マスがクリックされたときの処理
    function onCellClick(event) {
        const clickedCell = event.currentTarget;
        if (currentMode === 'swap') {
            handleSwapMode(clickedCell);
        } else if (currentMode === 'edit') {
            handleEditMode(clickedCell);
        }
    }

    // パネルの表示を更新
    function updatePanelVisibility() {
        // 全てのパネルを一旦隠す
        Object.values(panels).forEach(panel => panel.classList.add('hidden'));
        // 現在のモードに対応するパネルだけ表示
        if (panels[currentMode]) {
            panels[currentMode].classList.remove('hidden');
        }
    }
    
    // 盤面データ適用
    function applyGridData(gridData) {
        gridData.forEach((data, index) => {
            cells[index].innerHTML = data.content;
            cells[index].style.backgroundColor = data.color || '';
        });
    }

    // 編集モードの処理
    function handleEditMode(clickedCell) {
        if (editingCell) {
            editingCell.classList.remove('editing');
        }
        if (editingCell !== clickedCell) {
            clickedCell.classList.add('editing');
            editingCell = clickedCell;
            // 選択したマスの現在の色をカラーピッカーに反映
            const currentColor = editingCell.style.backgroundColor;
            colorInput.value = rgbToHex(currentColor) || '#f0f0f0';
        } else {
            editingCell = null;
        }
    }
    
    // 入れ替えモードの処理 (前回とほぼ同じ)
    function handleSwapMode(clickedCell) { /* ... 省略 ... */ }
    
    // 選択状態をリセット
    function resetSelections() { /* ... 省略 ... */ }
    
    // RGBを16進数カラーコードに変換するヘルパー関数
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return null;
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // --- 実行開始 ---
    initializeGrid();
    updatePanelVisibility();

    // 省略した関数の実装
    function handleSwapMode(clickedCell) {
        if (highlightedCell === null) {
            clickedCell.classList.add('highlighted');
            highlightedCell = clickedCell;
        } else if (highlightedCell === clickedCell) {
            clickedCell.classList.remove('highlighted');
            highlightedCell = null;
        } else {
            const tempContent = highlightedCell.innerHTML;
            const tempColor = highlightedCell.style.backgroundColor;
            highlightedCell.innerHTML = clickedCell.innerHTML;
            highlightedCell.style.backgroundColor = clickedCell.style.backgroundColor;
            clickedCell.innerHTML = tempContent;
            clickedCell.style.backgroundColor = tempColor;
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
        }
    }

    function resetSelections() {
        if (highlightedCell) {
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
        }
        if (editingCell) {
            editingCell.classList.remove('editing');
            editingCell = null;
        }
    }
});