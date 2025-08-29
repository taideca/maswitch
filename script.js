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
    const imageNameInput = document.getElementById('image-name-input');
    const updateImageBtn = document.getElementById('update-image-btn');
    const mainColorPicker = document.getElementById('main-color-picker');
    const colorTargetRadios = document.querySelectorAll('input[name="colorTarget"]');
    const borderToggles = document.querySelectorAll('input[name="borderToggle"]');
    const answerKeyInput = document.getElementById('answer-key-input');
    const fixCellCheckbox = document.getElementById('fix-cell-checkbox');
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const copyCodeBtn = document.getElementById('copy-code-btn');
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
            // cell.dataset.index = i; // インデックス番号をデータとして保持
            // cell.textContent = i + 1;
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
            // adjustFontSize(editingCell);
        } else {
            alert('編集したいマスを先にクリックしてください！');
        }
    });

    // 画像選択の処理をファイル名指定方式に変更
    updateImageBtn.addEventListener('click', () => {
        if (!editingCell) {
            alert('編集したいマスを先にクリックしてください！');
            return;
        }
        const filename = imageNameInput.value.trim();
        if (!filename) {
            alert('画像ファイル名を入力してください。');
            return;
        }
        
        const imagePath = `pictures/${filename}.png`;
        editingCell.innerHTML = `<img src="${imagePath}" alt="${filename}.png">`;
    });

    // 枠線選択
    borderToggles.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!editingCell) return;

            // 4つのチェックボックスの状態から "1010" のようなコードを生成
            let currentCode = Array.from(borderToggles).map(cb => cb.checked ? '1' : '0').join('');
            
            // 生成したコードをデータとしてマスに保存
            editingCell.dataset.borderCode = currentCode;
            
            // 保存したコードを元に影の見た目を更新
            applyShadowFromCode(editingCell, currentCode);
        });
    });

    // 固定チェックボックス
    fixCellCheckbox.addEventListener('change', () => {
        if (editingCell) {
            // チェック状態に応じて 'fixed' クラスを付け外しする
            editingCell.classList.toggle('fixed', fixCellCheckbox.checked);
            // 見た目をハイライト（後述のCSSで定義）
            editingCell.style.backgroundColor = fixCellCheckbox.checked ? '#ffffff' : (colorInput.value || '#ffffff');
        }
    });

    // カラーピッカーの値が変更されたら、選択中の適用先に色を反映
    mainColorPicker.addEventListener('input', () => {
        if (!editingCell) return;
        
        const selectedTarget = document.querySelector('input[name="colorTarget"]:checked').value;
        const newColor = mainColorPicker.value;

        if (selectedTarget === 'text') {
            editingCell.style.color = newColor;
        } else if (selectedTarget === 'background') {
            editingCell.style.backgroundColor = newColor;
        }
    });

    // ラジオボタン(適用先)が変更されたら、カラーピッカーの現在の色を更新
    colorTargetRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateColorPickerValue();
        });
    });

    // 【開発者向け】盤面データを出力するボタンの処理
    generateCodeBtn.addEventListener('click', () => {
        const answer = answerKeyInput.value.trim();
        if (!answer) {
            alert('謎の答えを入力してください。');
            return;
        }

        const gridData = [];
        cells.forEach(cell => {
            const borderCode = (cell.dataset.borderCode === "0000") ? "" : (cell.dataset.borderCode || ""); // データ属性からコードを取得
            if (borderCode === "0000") {
                borderCode = ""; // "0000"の場合は空文字に変換して保存
            }
            const cellData = [
                cell.innerHTML,
                cell.style.backgroundColor ? rgbToHex(cell.style.backgroundColor) : "",
                cell.style.color ? rgbToHex(cell.style.color) : "",
                borderCode, // 保存したコードを格納
                cell.classList.contains('fixed') ? 1 : 0 // 固定なら1, そうでなければ0
            ];
            gridData.push(cellData);
        });

        // データと答えを一つのオブジェクトにまとめる
        const puzzleObject = {
            data: gridData,
            answer: answer
        };

        // 配列を綺麗な形式のJSONテキストに変換して、テキストエリアに表示
        outputTextarea.value = formatJsonForGrid(puzzleObject);
        alert('盤面データを出力しました。テキストエリアからコピーしてquestions.jsonに貼り付けてください。');
    });

    // 【開発者向け】出力したコードをコピーするボタンの処理
    copyCodeBtn.addEventListener('click', () => {
        const codeToCopy = outputTextarea.value;
        if (!codeToCopy) {
            alert('先に出力ボタンを押してコードを生成してください。');
            return;
        }

        navigator.clipboard.writeText(codeToCopy).then(() => {
            alert('コードをクリップボードにコピーしました！');
        }).catch(err => {
            console.error('コピーに失敗しました:', err);
            alert('コピーに失敗しました。');
        });
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
                const puzzleObject = allPuzzles[loadId]; // IDに一致するデータを取得

                if (puzzleObject && puzzleObject.data) {
                    applyGridData(puzzleObject.data); // オブジェクトの中の "data" 配列だけを渡す
                    answerKeyInput.value = puzzleObject.answer || ''; // 答えもフォームに反映
                    alert(`ID:「${loadId}」の盤面を読み込みました。`);
                } else {
                    alert(`ID:「${loadId}」のデータが見つかりません。`);
                }
            })
            .catch(error => {
                console.error('ファイルの読み込みに失敗しました:', error);
                alert('データの読み込みに失敗しました。questions.jsonファイルが存在するか確認してください。');
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

    // 5x5形式でJSONテキストを整形する関数
    function formatJsonForGrid(puzzleObject) {
        let output = `"": {\n  `;
        output += `  "answer": "${puzzleObject.answer}",\n  `;
        output += `  "published": false,\n  `;
        output += '  "data": [\n      '; // data配列の開始

        const gridData = puzzleObject.data;
        for (let i = 0; i < gridData.length; i++) {
            // 1マス分のデータを文字列に変換
            output += JSON.stringify(gridData[i]);

            // 配列の最後の要素でなければ、カンマを追加
            if (i < gridData.length - 1) {
                output += ',';
            }

            // 5個目の要素ごと（行の終わり）に改行とインデントを追加
            if ((i + 1) % 5 === 0) {
                output += '\n      ';
            } else {
                // 行の途中ならスペースを追加
                output += ' ';
            }
        }
        // 最後の余分なインデントを削除し、終了の括弧を追加
        output = output.trimEnd() + '\n    ]\n  }';
        return output;
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
            // 全ての関連プロパティを一時変数に保存
            const temp = {
                content: highlightedCell.innerHTML,
                bgColor: highlightedCell.style.backgroundColor,
                textColor: highlightedCell.style.color,
                borderCode: highlightedCell.dataset.borderCode,
                boxShadow: highlightedCell.style.boxShadow
            };

            // highlightedCell に clickedCell のプロパティを適用
            highlightedCell.innerHTML = clickedCell.innerHTML;
            highlightedCell.style.backgroundColor = clickedCell.style.backgroundColor;
            highlightedCell.style.color = clickedCell.style.color;
            highlightedCell.dataset.borderCode = clickedCell.dataset.borderCode;
            highlightedCell.style.boxShadow = clickedCell.style.boxShadow;

            // clickedCell に temp のプロパティを適用
            clickedCell.innerHTML = temp.content;
            clickedCell.style.backgroundColor = temp.bgColor;
            clickedCell.style.color = temp.textColor;
            clickedCell.dataset.borderCode = temp.borderCode;
            clickedCell.style.boxShadow = temp.boxShadow;

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
            updateColorPickerValue();
            const borderCode = editingCell.dataset.borderCode || "0000";
            borderToggles.forEach((checkbox, index) => {
                checkbox.checked = borderCode[index] === '1';
            });
            fixCellCheckbox.checked = editingCell.classList.contains('fixed');
        } else {
            // 同じマスをクリックした場合は選択解除
            editingCell = null;
        }
    }

    // カラーピッカーに表示する色を、選択中の適用先に応じて更新する関数
    function updateColorPickerValue() {
        if (!editingCell) return;

        const selectedTarget = document.querySelector('input[name="colorTarget"]:checked').value;
        let targetColor = '';

        if (selectedTarget === 'text') {
            targetColor = editingCell.style.color;
        } else if (selectedTarget === 'background') {
            targetColor = editingCell.style.backgroundColor;
        } else if (selectedTarget === 'border') {
            targetColor = editingCell.dataset.borderColor;
        }

        mainColorPicker.value = rgbToHex(targetColor) || (selectedTarget === 'text' ? '#000000' : '#cccccc');
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

    function adjustFontSize(cell) {
        // 画像タグが含まれている場合は調整しない
        if (cell.querySelector('img')) {
            cell.style.fontSize = ''; // 画像がある場合はフォントサイズをリセット
            return;
        }

        // 一旦フォントサイズをリセットして、デフォルトの大きさに戻す
        cell.style.fontSize = ''; // スタイルをリセット

        // 探索するフォントサイズの上限と下限を設定
        let minSize = 8; // 最小フォントサイズ
        let maxSize = 100; // 最大フォントサイズ（マスの高さより大きめに設定）
        let bestSize = minSize; // 最適なサイズを保存する変数
    
        // 二分探索で最適なフォントサイズを見つける
        while (minSize <= maxSize) {
            let midSize = Math.floor((minSize + maxSize) / 2);
            cell.style.fontSize = `${midSize}px`;
    
            // はみ出しているかチェック
            if (cell.scrollWidth > cell.clientWidth || cell.scrollHeight > cell.clientHeight) {
                // はみ出している場合：上限を狭める
                maxSize = midSize - 1;
            } else {
                // 収まっている場合：このサイズを候補として保存し、下限を広げてさらに大きいサイズを探す
                bestSize = midSize;
                minSize = midSize + 1;
            }
        }
    
        // 見つかった最適なサイズを最終的に適用
        cell.style.fontSize = `${bestSize}px`;
    }
    
    // 盤面データ適用
    function applyGridData(gridData) {
        gridData.forEach((dataArray, index) => {
            if (cells[index]) {
                const cell = cells[index];
                cell.innerHTML = dataArray[0] || '';
                cell.style.backgroundColor = dataArray[1] || '';
                cell.style.color = dataArray[2] || '';
                const borderCode = dataArray[3] || "0000";
                cell.dataset.borderCode = borderCode; // コードをデータとして保存
                applyShadowFromCode(cell, borderCode); // 保存したコードを元に影を適用
                const isFixed = dataArray[4] === 1;
                cell.classList.toggle('fixed', isFixed);
                // adjustFontSize(cells[index]);
            }
        });
    }

    // 枠線コードからbox-shadowを生成
    function applyShadowFromCode(cell, borderCode = "0000") {
        const shadowParts = [];
        const shadowWidth = '3px';
        const shadowColor = 'black'; // 線の色は黒で統一

        if (borderCode[0] === '1') shadowParts.push(`inset 0 ${shadowWidth} 0 0 ${shadowColor}`);  // 上
        if (borderCode[1] === '1') shadowParts.push(`inset -${shadowWidth} 0 0 0 ${shadowColor}`); // 右
        if (borderCode[2] === '1') shadowParts.push(`inset 0 -${shadowWidth} 0 0 ${shadowColor}`); // 下
        if (borderCode[3] === '1') shadowParts.push(`inset ${shadowWidth} 0 0 0 ${shadowColor}`);  // 左

        cell.style.boxShadow = shadowParts.join(', ');
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
