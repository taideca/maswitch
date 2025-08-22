document.addEventListener('DOMContentLoaded', () => {

    const gridContainer = document.getElementById('grid-container');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const correctCountSpan = document.getElementById('correct-count');
    
    let cells = [];
    let highlightedCell = null;
    let correctAnswer = '';
    let originalGridState = [];

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
        // ▼▼▼ ページを開いたときに読み込む謎を設定 ▼▼▼
        loadPuzzleById('law'); 
    }

    // --- イベントリスナー ---
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

    // IDを指定してquestions.jsonから問題を読み込む
    function loadPuzzleById(puzzleId) {
        fetch('questions.json')
            .then(response => response.json())
            .then(allPuzzles => {
                const puzzleObject = allPuzzles[puzzleId];
                if (puzzleObject && puzzleObject.data && puzzleObject.answer) {
                    originalGridState = JSON.parse(JSON.stringify(puzzleObject.data)); // シャッフル前に正しい盤面をコピー
                    applyGridData(puzzleObject.data); // 盤面データを適用
                    correctAnswer = puzzleObject.answer; // 答えを保存
                } else {
                    console.error(`ID:「${puzzleId}」のデータまたは答えが見つかりません。`);
                }
            })
            .catch(error => console.error('questions.jsonの読み込みに失敗:', error));
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
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
            updateCorrectCount();
        }
    }
    
    // 盤面データ適用
    function applyGridData(gridData) {
        gridData.forEach((data, index) => {
            if (cells[index]) {
                cells[index].innerHTML = data.content;
                cells[index].style.backgroundColor = data.color || '';
                cells[index].classList.toggle('fixed', data.fixed === true);
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
            // forループの先頭を、こちらに差し替えてください
            console.log(`--- マス ${i} の比較 ---`);
            console.log("元のデータ (originalGridState):", originalGridState[i]);
            console.log("現在のマス (cells):", cells[i]);
            
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
