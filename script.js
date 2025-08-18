document.addEventListener('DOMContentLoaded', () => {

    const cells = document.querySelectorAll('.grid-item');
    const textInput = document.getElementById('text-input');
    const updateTextBtn = document.getElementById('update-text-btn');
    const imageInput = document.getElementById('image-input');
    
    let highlightedCell = null; // 入れ替え用に1つ目に選択したマス
    let editingCell = null;     // 編集対象として選択したマス

    // --- マスのクリック処理 ---
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            // もし編集対象が選択されていて、それがクリックしたセルでなければ編集状態を解除
            if (editingCell && editingCell !== cell) {
                editingCell.classList.remove('editing');
                editingCell = null;
            }

            // クリックしたセルの編集状態を切り替える（トグル）
            cell.classList.toggle('editing');

            // もし'editing'クラスが追加されたら、そのセルを編集対象にする
            if (cell.classList.contains('editing')) {
                editingCell = cell;
                // 他のセルのハイライト（入れ替え用）は解除する
                if(highlightedCell) {
                    highlightedCell.classList.remove('highlighted');
                    highlightedCell = null;
                }
            } else {
                // 編集状態が解除されたら、編集対象をnullにする
                editingCell = null;
            }

            // --- ここから入れ替え処理（編集モードでない場合のみ動作）---
            if (!editingCell) {
                if (highlightedCell === null) {
                    cell.classList.add('highlighted');
                    highlightedCell = cell;
                } else if (highlightedCell === cell) {
                    cell.classList.remove('highlighted');
                    highlightedCell = null;
                } else {
                    const tempContent = highlightedCell.innerHTML;
                    highlightedCell.innerHTML = cell.innerHTML;
                    cell.innerHTML = tempContent;

                    highlightedCell.classList.remove('highlighted');
                    highlightedCell = null;
                }
            }
        });
    });

    // --- 「テキストで更新」ボタンの処理 ---
    updateTextBtn.addEventListener('click', () => {
        // 編集対象のマスが選択されていて、テキストが入力されている場合
        if (editingCell && textInput.value) {
            editingCell.innerHTML = ''; // 中身を一度空にする
            editingCell.textContent = textInput.value; // テキストを入力
            textInput.value = ''; // 入力フォームを空にする
        } else {
            alert('編集したいマスを先にクリックしてください！');
        }
    });

    // --- 画像ファイルが選択されたときの処理 ---
    imageInput.addEventListener('change', (event) => {
        // 編集対象のマスが選択されている場合
        if (editingCell) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();

                // ファイルの読み込みが完了したら実行される
                reader.onload = (e) => {
                    editingCell.innerHTML = ''; // 中身を一度空にする
                    const img = document.createElement('img'); // img要素を新しく作成
                    img.src = e.target.result; // 読み込んだ画像データをsrcに設定
                    editingCell.appendChild(img); // マスにimg要素を追加
                };

                // ファイルをData URLとして読み込む
                reader.readAsDataURL(file);
            }
        } else {
            alert('画像をセットしたいマスを先にクリックしてください！');
            imageInput.value = ''; // ファイル選択をリセット
        }
    });

});