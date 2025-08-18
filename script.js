document.addEventListener('DOMContentLoaded', () => {

    // --- HTML要素の取得 ---
    const cells = document.querySelectorAll('.grid-item');
    const textInput = document.getElementById('text-input');
    const updateTextBtn = document.getElementById('update-text-btn');
    const imageInput = document.getElementById('image-input');
    const modeRadios = document.querySelectorAll('input[name="mode"]');

    // --- 状態を管理する変数 ---
    let highlightedCell = null; // 入れ替え用に1つ目に選択したマス
    let editingCell = null;     // 編集対象として選択したマス
    let currentMode = 'swap';   // 現在の操作モード (swap or edit)

    // --- モード切替のイベントリスナー ---
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentMode = event.target.value;
            // モードが切り替わったら、選択状態をすべてリセットする
            resetSelections();
        });
    });

    // --- 各マスをクリックしたときの処理 ---
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (currentMode === 'swap') {
                handleSwapMode(cell);
            } else { // currentMode === 'edit'
                handleEditMode(cell);
            }
        });
    });

    // --- 入れ替えモードの処理 ---
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
            // 3. 2つ目のマスを選択したら、中身を入れ替える
            const tempContent = highlightedCell.innerHTML;
            highlightedCell.innerHTML = clickedCell.innerHTML;
            clickedCell.innerHTML = tempContent;

            // 入れ替え終わったら選択状態をリセット
            highlightedCell.classList.remove('highlighted');
            highlightedCell = null;
        }
    }

    // --- 編集モードの処理 ---
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
        } else {
            // 同じマスをクリックした場合は選択解除
            editingCell = null;
        }
    }

    // --- 選択状態をすべてリセットする関数 ---
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


    // --- テキスト更新ボタンの処理（変更なし） ---
    updateTextBtn.addEventListener('click', () => {
        if (editingCell && textInput.value) {
            editingCell.innerHTML = '';
            editingCell.textContent = textInput.value;
            textInput.value = '';
        } else {
            alert('編集したいマスを先にクリックしてください！');
        }
    });

    // --- 画像ファイル選択の処理（変更なし） ---
    imageInput.addEventListener('change', (event) => {
        if (editingCell) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    editingCell.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    editingCell.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        } else {
            alert('画像をセットしたいマスを先にクリックしてください！');
            imageInput.value = '';
        }
    });
});