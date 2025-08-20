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
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const outputTextarea = document.getElementById('output-textarea');

    // 検索パネルの要素
    const loadIdInput = document.getElementById('load-id-input');
    const loadBtn = document.getElementById('load-btn');
    
    let cells = []; // マス要素を格納する配列

    // --- 状態を管理する変数 ---
    let highlightedCell = null; // 入れ替え用に選択したマス
    let editingCell = null;     // 編集対象として選択したマス
    let currentMode = 'swap';   // 現在の操作モード

    // --- 初期化処理 ---
    function initializeGrid() {
        gridContainer.innerHTML = ''; // グリッドをクリア
        for (let i = 0; i < 25; i++) {
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
        if (editingCell) {
            editingCell.innerHTML = '';
            editingCell.textContent = textInput.value;
        } else {
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
            imageInput.value = ''; // 選択をリセット
        }
    });

    // カラーピッカー
    colorInput.addEventListener('input', () => {
        if (editingCell) {
            editingCell.style.backgroundColor = colorInput.value;
        }
    });

    // ▼▼▼ 【開発者向け】盤面データを出力するボタンの処理 ▼▼▼
    generateCodeBtn.addEventListener('click', () => {
        const gridData = [];
        cells.forEach(cell => {
            const cellColor = cell.style.backgroundColor ? rgbToHex(cell.style.backgroundColor) : "";
            gridData.push({
                content: cell.innerHTML,
                color: cellColor
            });
        });

        // 配列を綺麗な形式のJSONテキストに変換して、テキストエリアに表示
        outputTextarea.value = JSON.stringify(gridData, null, 2);
        alert('盤面データを出力しました。テキストエリアからコピーしてquestions.jsonに貼り付けてください。');
    });

    // 読込ボタン (questions.json を読み込むように変更)
    loadBtn.addEventListener('click', () => {
        const loadId = loadIdInput.value.trim();
        if (!loadId) {
            alert('読込IDを入力してください。');
            return;
        }

        // JSONファイルを読み込む
        fetch('questions.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('ネットワークの応答が正しくありませんでした。');
                }
                return response.json(); // ファイルをJSONとして解釈
            })
            .then(allPuzzles => {
                const puzzleData = allPuzzles[loadId]; // IDに一致するデータを取得

                if (puzzleData) {
                    applyGridData(puzzleData);
                    alert(`ID:「${loadId}」の盤面を読み込みました。`);
                } else {
                    alert(`ID:「${loadId}」のデータが見つかりません。`);
                }
            })
            .catch(error => {
                console.error('ファイルの読み込みに失敗しました:', error);
                alert('データの読み込みに失敗しました。puzzles.jsonファイルが存在するか確認してください。');
            });
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
        // searchモードではマスをクリックしても何もしない
    }
    
    // 入れ替えモードの処理
    function handleSwapMode(clickedCell) {
        // 編集モードの選択は解除
        if (editingCell) {
            editingCell.classList.remove('editing');
            editingCell = null;
        }

        if (highlightedCell === null) {
            // 1. 最初のマスを選択
            clickedCell.classList.add('highlighted');
            highlightedCell = clickedCell;
        } else if (highlightedCell === clickedCell) {
            // 2. 同じマスをクリックしたら選択解除
            clickedCell.classList.remove('highlighted');
            highlightedCell = null;
        } else {
            // 3. 2つ目のマスを選択したら、中身と色を入れ替える
            const tempContent = highlightedCell.innerHTML;
            const tempColor = highlightedCell.style.backgroundColor;
            
            highlightedCell.innerHTML = clickedCell.innerHTML;
            highlightedCell.style.backgroundColor = clickedCell.style.backgroundColor;
            
            clickedCell.innerHTML = tempContent;
            clickedCell.style.backgroundColor = tempColor;

            // 入れ替え終わったら選択状態をリセット
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
        }
    }

    // 編集モードの処理
    function handleEditMode(clickedCell) {
        // 入れ替えモードの選択は解除
        if (highlightedCell) {
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
        }

        // すでに選択されているマスがあれば、一旦解除
        if (editingCell) {
            editingCell.classList.remove('editing');
        }

        // クリックしたマスが、選択中だったマスと同じでなければ、新しく選択する
        if (editingCell !== clickedCell) {
            clickedCell.classList.add('editing');
            editingCell = clickedCell;
            // 選択したマスの現在の色をカラーピッカーに反映
            const currentColor = editingCell.style.backgroundColor;
            colorInput.value = rgbToHex(currentColor) || '#f0f0f0';
        } else {
            // 同じマスをクリックした場合は選択解除
            editingCell = null;
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
            if (cells[index]) {
                cells[index].innerHTML = data.content;
                cells[index].style.backgroundColor = data.color || '';
            }
        });
    }

    // 選択状態をすべてリセットする関数
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
    
    // RGBを16進数カラーコードに変換するヘルパー関数
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb; // rgb形式でなければそのまま返す
        try {
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        } catch (e) {
            return '#f0f0f0'; // 変換に失敗した場合のデフォルト値
        }
    }
    
    // --- 実行開始 ---
    initializeGrid();
    updatePanelVisibility();
});