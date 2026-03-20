const hiragana_table = [
    [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']],
    [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']],
    [['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']],
    [['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to']],
    [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']],
    [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho']],
    [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']],
    [['や', 'ya'], null, ['ゆ', 'yu'], null, ['よ', 'yo']],
    [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']],
    [['わ', 'wa'], null, null, null, ['を', 'wo (o)']],
    [['ん', 'n'], null, null, null, null]
];

const hiragana_dakuon_table = [
    [['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go']],
    [['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo']],
    [['だ', 'da'], ['ぢ', 'di (ji)'], ['づ', 'du (zu)'], ['で', 'de'], ['ど', 'do']],
    [['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo']],
    [['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po']],
];

const katakana_table = [
    [['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o']],
    [['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko']],
    [['サ', 'sa'], ['シ', 'shi'], ['ス', 'su'], ['セ', 'se'], ['ソ', 'so']],
    [['タ', 'ta'], ['チ', 'chi'], ['ツ', 'tsu'], ['テ', 'te'], ['ト', 'to']],
    [['ナ', 'na'], ['ニ', 'ni'], ['ヌ', 'nu'], ['ネ', 'ne'], ['ノ', 'no']],
    [['ハ', 'ha'], ['ヒ', 'hi'], ['フ', 'fu'], ['ヘ', 'he'], ['ホ', 'ho']],
    [['マ', 'ma'], ['ミ', 'mi'], ['ム', 'mu'], ['メ', 'me'], ['モ', 'mo']],
    [['ヤ', 'ya'], null, ['ユ', 'yu'], null, ['ヨ', 'yo']],
    [['ラ', 'ra'], ['リ', 'ri'], ['ル', 'ru'], ['レ', 're'], ['ロ', 'ro']],
    [['ワ', 'wa'], null, null, null, ['ヲ', 'wo']],
    [['ン', 'n'], null, null, null, null],
];

const katakana_dakuon_table = [
    [['ガ', 'ga'], ['ギ', 'gi'], ['グ', 'gu'], ['ゲ', 'ge'], ['ゴ', 'go']],
    [['ザ', 'za'], ['ジ', 'ji'], ['ズ', 'zu'], ['ゼ', 'ze'], ['ゾ', 'zo']],
    [['ダ', 'da'], ['ヂ', 'di (ji)'], ['ヅ', 'du (zu)'], ['デ', 'de'], ['ド', 'do']],
    [['バ', 'ba'], ['ビ', 'bi'], ['ブ', 'bu'], ['ベ', 'be'], ['ボ', 'bo']],
    [['パ', 'pa'], ['ピ', 'pi'], ['プ', 'pu'], ['ペ', 'pe'], ['ポ', 'po']],
];

function buildKanaTable(tableData, tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) {
        console.error(`Tbody für ${tableId} nicht gefunden!`);
        return;
    }

    tableData.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            if (cell) {
                const [jp, rom] = cell;

                td.innerHTML = `
                    <div class="jp">${jp}</div>
                    <div class="rom">${rom}</div>
                    <div class="progress"></div>
                `;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}


buildKanaTable(hiragana_table, 'hiragana-table');
buildKanaTable(hiragana_dakuon_table, 'hiragana-dakuon-table');
buildKanaTable(katakana_table, 'katakana-table');
buildKanaTable(katakana_dakuon_table, 'katakana-dakuon-table');