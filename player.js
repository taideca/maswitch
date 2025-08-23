document.addEventListener('DOMContentLoaded', () => {

    // --- ポップアップ関連の要素を取得 ---
    const openRulesBtn = document.getElementById('open-rules-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const popupOverlay = document.getElementById('popup-overlay');

    // --- ポップアップのイベントリスナー ---
    // 「遊び方を見る」ボタンが押されたら、hiddenクラスを外して表示
    openRulesBtn.addEventListener('click', () => {
        popupOverlay.classList.remove('hidden');
    });

    // 「閉じる」ボタンが押されたら、hiddenクラスを付けて非表示
    closeRulesBtn.addEventListener('click', () => {
        popupOverlay.classList.add('hidden');
    });

    // 背景の黒い部分が押されたときも、ポップアップを閉じる
    popupOverlay.addEventListener('click', (event) => {
        // クリックされたのが背景自身(popup-overlay)の場合のみ閉じる
        if (event.target === popupOverlay) {
            popupOverlay.classList.add('hidden');
        }
    });

    const gridContainer = document.getElementById('grid-container');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const correctCountSpan = document.getElementById('correct-count');
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sideMenu = document.getElementById('side-menu');
    const puzzleList = document.getElementById('puzzle-list');
    
    let cells = [];
    let highlightedCell = null;
    let correctAnswer = '';
    let originalGridState = [];
    let allPuzzles = {};

    // --- 初期化処理 ---
    function initializeGrid() {
        gridContainer.innerHTML = '';
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            gridContainer.appendChild(cell);
            cell.addEventListener('click', onCellClick);
        }
        cells = document.querySelectorAll('.grid-item');
        loadAllPuzzles();
    }

    // --- イベントリスナー ---

    // メニュー開閉ボタン
    menuToggleBtn.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
    });

    submitBtn.addEventListener('click', () => {
        const userAnswer = answerInput.value.trim();
        if (!userAnswer) {
            alert('答えを入力してください。');
            return;
        }

        // ▼▼▼ 合言葉を入力すると開発者ページに移動 ▼▼▼
        if (userAnswer === 'iamadeveloper') { // ← この合言葉を自由に変更してください
            alert('開発者モードに切り替えます。');
            window.location.href = 'admin.html'; // admin.htmlにページ遷移
            return;
        }

        // 正誤判定処理
        if (userAnswer === correctAnswer) {
            alert('正解！おめでとうございます！');
        } else {
            alert('答えが違うようです。');
        }
        answerInput.value = ''; // 入力欄を空にする
    });

    // --- 主要な関数 ---

    // 最初に一度だけ、questions.jsonを全て読み込む
    function loadAllPuzzles() {
        fetch('questions.json')
            .then(response => response.json())
            .then(puzzles => {
                allPuzzles = puzzles;
                populatePuzzleList(); // 問題リストをメニューに生成
                // ▼▼▼ 初期問題の設定 ▼▼▼
                loadPuzzleById('color1');
            })
            .catch(error => console.error('questions.jsonの読み込みに失敗:', error));
    }
    
    // 問題リストをサイドメニューに生成する
    function populatePuzzleList() {
        puzzleList.innerHTML = ''; // リストを一旦空にする
        const allPuzzleKeys = Object.keys(allPuzzles); // 問題のIDを取得
        const excludedIds = ['template', 'rule']; // 除外したいIDのリストを定義
        const filteredKeys = allPuzzleKeys.filter(key => !excludedIds.includes(key)); // 除外リストに含まれないIDだけを抽出

        filteredKeys.forEach((key, index) => {
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            
            // "No.001" のようにゼロ埋めして表示
            button.textContent = `No.${String(index + 1).padStart(3, '0')}`;
            
            // ボタンに、対応する問題のキー(ID)をデータとして埋め込む
            button.dataset.puzzleId = key;
            
            button.addEventListener('click', () => {
                loadPuzzleById(key); // ボタンに対応する問題を読み込む
                sideMenu.classList.remove('open'); // 問題を選んだらメニューを閉じる
            });
            
            listItem.appendChild(button);
            puzzleList.appendChild(listItem);
        });
    }

    // IDを指定してquestions.jsonから問題を読み込む
    function loadPuzzleById(puzzleId) {
        const puzzleObject = allPuzzles[puzzleId];
        if (puzzleObject && puzzleObject.data && puzzleObject.answer) {
            originalGridState = JSON.parse(JSON.stringify(puzzleObject.data));
            applyGridData(puzzleObject.data);
            correctAnswer = puzzleObject.answer;
        } else {
            console.error(`ID:「${puzzleId}」のデータが見つかりません。`);
        }
    }

    // マスをクリックしたときの処理（入れ替え）
    function onCellClick(event) {
        const clickedCell = event.currentTarget;
        // 固定マスなら何もしない
        if (clickedCell.classList.contains('fixed')) {
            return;
        }
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
            adjustFontSize(highlightedCell);
            adjustFontSize(clickedCell);
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
            updateCorrectCount();
        }
    }

    function adjustFontSize(cell) {
        // 画像タグが含まれている場合は調整しない
        if (cell.querySelector('img')) {
            cell.style.fontSize = ''; // 画像がある場合はフォントサイズをリセット
            return;
        }

        // 一旦フォントサイズをリセットして、デフォルトの大きさに戻す
        cell.style.fontSize = '';

        // 内容がマスからはみ出している間、ループで少しずつフォントを小さくする
        // clientWidth はマスの内側の幅、scrollWidth は内容全体の幅
        let currentSize = parseInt(window.getComputedStyle(cell).fontSize, 10);
        while (cell.scrollWidth > cell.clientWidth || cell.scrollHeight > cell.clientHeight) {
            currentSize--;
            cell.style.fontSize = `${currentSize}px`;

            // フォントが小さくなりすぎたらループを抜ける
            if (currentSize <= 8) {
                break;
            }
        }
    }
    
    // 盤面データ適用
    function applyGridData(gridData) {
        gridData.forEach((data, index) => {
            if (cells[index]) {
                cells[index].innerHTML = data.content;
                cells[index].style.backgroundColor = data.color || '';
                cells[index].classList.toggle('fixed', data.fixed === true);
                adjustFontSize(cells[index]);
            }
        });
        shuffleGrid();
    }

    // マスをランダムに入れ替え
    function shuffleGrid() {
        const movableCells = []; // 動かせるマスだけを格納する配列
        const fixedCells = [];   // 固定マスを格納する配列

        // マスを「動かせるマス」と「固定マス」に分類
        cells.forEach((cell, index) => {
            const state = {
                content: cell.innerHTML,
                color: cell.style.backgroundColor,
                originalIndex: index // 元の位置を覚えておく
            };
            if (cell.classList.contains('fixed')) {
                fixedCells.push(state);
            } else {
                movableCells.push(state);
            }
        });

        // ▼▼▼ 動かせるマスだけをシャッフル ▼▼▼
        for (let i = movableCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [movableCells[i], movableCells[j]] = [movableCells[j], movableCells[i]];
        }

        // シャッフル後の動かせるマスと、元の固定マスを結合して盤面を再構築
        let movableIndex = 0;
        for (let i = 0; i < cells.length; i++) {
            // この位置がもともと固定マスだったかチェック
            const isFixed = fixedCells.some(cell => cell.originalIndex === i);
            if (!isFixed) {
                const state = movableCells[movableIndex];
                cells[i].innerHTML = state.content;
                cells[i].style.backgroundColor = state.color;
                movableIndex++;
            }
        }

        updateCorrectCount();
    }

    // 正しい位置にあるマスの数を数えて表示を更新
    function updateCorrectCount() {
        let correctCount = 0;
        for (let i = 0; i < cells.length; i++) {
            // 固定マスは常に正しい位置にあるとみなす
            if (cells[i].classList.contains('fixed')) {
                correctCount++;
                continue; // 次のループへ
            }
            
            const originalCell = originalGridState[i]; // 元の正しいマスの状態を取得
            const currentCellColor = rgbToHex(cells[i].style.backgroundColor); // 現在のマスの色を取得 (rgb形式をhex形式に変換)
            const originalCellColor = originalCell.color || ""; // 元の正しいマスの色を取得 (空の場合もあるので考慮)
            const isContentMatch = (cells[i].innerHTML === originalCell.content); // ① マスの内容(innerHTML)が一致しているか？
            const isColorMatch = (currentCellColor === originalCellColor); // ② マスの背景色が一致しているか？

            // 内容と色の両方が一致していればカウント
            if (isContentMatch && isColorMatch) {
                correctCount++;
            }
        }
        correctCountSpan.textContent = correctCount;
    }

    // RGBを16進数カラーコードに変換
    function rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb; // rgb形式でなければそのまま返す
        try {
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
        } catch (e) {
            return ''; // 変換に失敗した場合は空文字を返す
        }
    }

    // --- 実行開始 ---
    initializeGrid();
});
