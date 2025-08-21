document.addEventListener('DOMContentLoaded', () => {

    const gridContainer = document.getElementById('grid-container');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    
    let cells = [];
    let highlightedCell = null;
    let correctAnswer = '';

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
        loadPuzzleById('color1'); 
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
    
    // 盤面データ適用
    function applyGridData(gridData) {
        gridData.forEach((data, index) => {
            if (cells[index]) {
                cells[index].innerHTML = data.content;
                cells[index].style.backgroundColor = data.color || '';
            }
        });
        shuffleGrid();
    }

    // マスをランダムに入れ替え
    function shuffleGrid() {
        // 現在の盤面の content と color を配列として一時保存
        const currentGridState = [];
        cells.forEach(cell => {
            currentGridState.push({
                content: cell.innerHTML,
                color: cell.style.backgroundColor
            });
        });

        // フィッシャー–イェーツのシャッフルアルゴリズムで配列を並べ替える
        for (let i = currentGridState.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // 要素を交換
            [currentGridState[i], currentGridState[j]] = [currentGridState[j], currentGridState[i]];
        }
        
        // シャッフルされた配列を実際のマスに再適用する
        currentGridState.forEach((state, index) => {
            cells[index].innerHTML = state.content;
            cells[index].style.backgroundColor = state.color;
        });
    }

    // --- 実行開始 ---
    initializeGrid();
});