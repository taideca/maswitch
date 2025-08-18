// HTMLが読み込まれた後に実行する
document.addEventListener('DOMContentLoaded', () => {

    // すべてのマス要素を取得
    const cells = document.querySelectorAll('.grid-item');

    // 現在ハイライトされているマスを保存する変数
    let highlightedCell = null;

    // 各マスにクリックイベントを追加
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            // 1. どのマスもハイライトされていない場合
            if (highlightedCell === null) {
                // クリックしたマスをハイライトする
                cell.classList.add('highlighted');
                highlightedCell = cell;
            }
            // 2. クリックしたマスが、すでにハイライトされているマスと同じ場合
            else if (highlightedCell === cell) {
                // ハイライトを解除する
                cell.classList.remove('highlighted');
                highlightedCell = null;
            }
            // 3. 別のマスがハイライトされている場合
            else {
                // --- マスの中身を入れ替える処理 ---
                // 一時的に、ハイライトされているマスの中身を保存
                const tempContent = highlightedCell.innerHTML;
                
                // ハイライトされているマスに、今回クリックしたマスの中身を入れる
                highlightedCell.innerHTML = cell.innerHTML;
                
                // 今回クリックしたマスに、保存しておいた中身を入れる
                cell.innerHTML = tempContent;
                // --- 入れ替え処理ここまで ---

                // 最初のマスのハイライトを解除
                highlightedCell.classList.remove('highlighted');
                
                // ハイライト状態をリセット
                highlightedCell = null;
            }
        });
    });
});