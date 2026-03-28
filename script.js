let charsPerQuestion = 1; // Anzahl der Zeichen pro Frage
let bias = 50; // 0 = komplett zufällig, 100 = komplett performance-basiert
var hint_c = 3;

let playSounds = true; // Ob Sounds abgespielt werden sollen

const hiraganaList = {
    // Klarer Klang (Seion)
    A: "あ", I: "い", U: "う", E: "え", O: "お",
    KA: "か", KI: "き", KU: "く", KE: "け", KO: "こ",
    SA: "さ", SHI: "し", SU: "す", SE: "せ", SO: "そ",
    TA: "た", CHI: "ち", TSU: "つ", TE: "て", TO: "と",
    NA: "な", NI: "に", NU: "ぬ", NE: "ね", NO: "の",
    HA: "は", HI: "ひ", FU: "ふ", HE: "へ", HO: "ほ",
    MA: "ま", MI: "み", MU: "む", ME: "め", MO: "も",
    YA: "や", YU: "ゆ", YO: "よ",
    RA: "ら", RI: "り", RU: "る", RE: "れ", RO: "ろ",
    WA: "わ", WO: "を",
    N: "ん",

    // Dakuon (stimmhaft)
    GA: "が", GI: "ぎ", GU: "ぐ", GE: "げ", GO: "ご",
    ZA: "ざ", JI: "じ", ZU: "ず", ZE: "ぜ", ZO: "ぞ",
    DA: "だ", DI: "ぢ", DU: "づ", DE: "で", DO: "ど",
    BA: "ば", BI: "び", BU: "ぶ", BE: "べ", BO: "ぼ",

    // Handakuon (halb-stimmhaft)
    PA: "ぱ", PI: "ぴ", PU: "ぷ", PE: "ぺ", PO: "ぽ"
};

const rHiraganaList = Object.entries(hiraganaList).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});

const katakanaList = {
    // Klarer Klang (Seion)
    A: "ア", I: "イ", U: "ウ", E: "エ", O: "オ",
    KA: "カ", KI: "キ", KU: "ク", KE: "ケ", KO: "コ",
    SA: "サ", SHI: "シ", SU: "ス", SE: "セ", SO: "ソ",
    TA: "タ", CHI: "チ", TSU: "ツ", TE: "テ", TO: "ト",
    NA: "ナ", NI: "ニ", NU: "ヌ", NE: "ネ", NO: "ノ",
    HA: "ハ", HI: "ヒ", FU: "フ", HE: "ヘ", HO: "ホ",
    MA: "マ", MI: "ミ", MU: "ム", ME: "メ", MO: "モ",
    YA: "ヤ", YU: "ユ", YO: "ヨ",
    RA: "ラ", RI: "リ", RU: "ル", RE: "レ", RO: "ロ",
    WA: "ワ", WO: "ヲ",
    N: "ン",

    // Dakuon (stimmhaft)
    GA: "ガ", GI: "ギ", GU: "グ", GE: "ゲ", GO: "ゴ",
    ZA: "ザ", JI: "ジ", ZU: "ズ", ZE: "ゼ", ZO: "ゾ",
    DA: "ダ", DI: "ヂ", DU: "ヅ", DE: "デ", DO: "ド",
    BA: "バ", BI: "ビ", BU: "ブ", BE: "ベ", BO: "ボ",

    // Handakuon (halb-stimmhaft)
    PA: "パ", PI: "ピ", PU: "プ", PE: "ペ", PO: "ポ"
};

const rKatakanaList = Object.entries(katakanaList).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});



function addListAttributes(originalTable) {
    const newTable = {};

    for (const [key, value] of Object.entries(originalTable)) {
        newTable[key] = {
            char: value,
            times_learned: 0,
            times_correct: 0,
            last10_correct: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
    }

    return newTable;
}

let AccHiraganaList = addListAttributes(hiraganaList);
let AccKatakanaList = addListAttributes(katakanaList);

var totalCount = 0; // Gesamtanzahl der Fragen
var correctCount = 0; // Anzahl der richtigen Antworten


var currentQuestion = null;
var got_wrong = false;
var got_wrong_count = 0;


function compressAccuracyData(AccHiraganaList, hiraganaList) {
    const compressedData = [];

    // Iterate over each character in hiraganaList
    for (const key in hiraganaList) {
        // Get accuracy data for this key
        const accuracyData = AccHiraganaList[key];
        if (!accuracyData) continue;  // If no data for this key, skip it

        // Pack the last10_correct array into a single integer (bitwise operations)
        let packedLast10 = 0;
        for (let i = 0; i < accuracyData.last10_correct.length; i++) {
            packedLast10 |= accuracyData.last10_correct[i] << (9 - i); // Shift to correct bit position
        }

        // Add the compressed data for this character to the result
        compressedData.push([key, accuracyData.times_learned, accuracyData.times_correct, packedLast10]);
    }

    return compressedData;
}

function decompressAccuracyData(compressedData) {
    const decompressedData = {};

    // Iterate over each compressed entry
    compressedData.forEach(entry => {
        const key = entry[0];
        const times_learned = entry[1];
        const times_correct = entry[2];
        const packedLast10 = entry[3];

        // Rebuild the last10_correct array by extracting bits from packedLast10
        let last10_correct = [];
        for (let i = 9; i >= 0; i--) {
            // Extract the i-th bit from packedLast10
            const bit = (packedLast10 >> i) & 1;
            last10_correct.push(bit);
        }

        // Store the decompressed data in the result object
        decompressedData[key] = {
            times_learned,
            times_correct,
            last10_correct
        };
    });

    return decompressedData;
}

function getRandomActiveCell() {
    const activeCells = document.querySelectorAll('td.active');
    if (activeCells.length === 0) {
        return null; // Keine aktiven Zellen vorhanden
    }
    const randomIndex = Math.floor(Math.random() * activeCells.length);
    return activeCells[randomIndex];
}


function newQuestion() {
    scheduleAccuracyUpload();

    const activeCells = Array.from(document.querySelectorAll('td.active'));
    if (activeCells.length === 0) {
        console.log("Keine aktiven Felder gefunden.");
        return;
    }

    const weightedCells = activeCells.map(cell => {
        const jpChar = cell.querySelector('.jp')?.textContent;
        const romajiRaw = cell.querySelector('.rom')?.textContent || '';
        const romaji = romajiRaw.split(' ')[0].toUpperCase();

        const isHiragana = !!rHiraganaList[jpChar];
        const accList = isHiragana ? AccHiraganaList : AccKatakanaList;
        const stats = accList?.[romaji];

        if (!jpChar || !stats) return null;

        const { times_learned = 1, times_correct = 0, last10_correct = [] } = stats;

        // Fehler- und Gewichtungslogik
        const errorRate = 1 - (times_correct / Math.max(times_learned, 1));
        const recentAccuracy = last10_correct.reduce((a, b) => a + b, 0) / last10_correct.length || 0;
        const recentErrorRate = 1 - recentAccuracy;

        const baseWeight = (errorRate + recentErrorRate) / 2;

        // Bias-Mischung
        const adjustedWeight = (bias / 100) * baseWeight + (1 - bias / 100) * 1;

        return { cell, weight: adjustedWeight };
    }).filter(Boolean);

    const selectedCells = [];

    while (selectedCells.length < charsPerQuestion) {
        const totalWeight = weightedCells.reduce((sum, { weight }) => sum + weight, 0);
        let rand = Math.random() * totalWeight;

        for (const { cell, weight } of weightedCells) {
            if ((rand -= weight) <= 0) {
                const jpChar = cell.querySelector('.jp')?.textContent;
                if (jpChar && !selectedCells.some(c => c.jp === jpChar)) {
                    const romajiRaw = cell.querySelector('.rom')?.textContent || '';
                    const romaji = romajiRaw.split(' ')[0].toUpperCase();

                    let characterType = rHiraganaList[jpChar] ? "Hiragana" : rKatakanaList[jpChar] ? "Katakana" : "Unbekannt";

                    selectedCells.push({
                        romaji: romaji,
                        jp: jpChar,
                        progress: cell.querySelector('.progress'),
                        element: cell,
                        type: characterType
                    });
                }
                break;
            }
        }
    }

    const combinedJP = selectedCells.map(c => c.jp).join('');
    const combinedRomaji = selectedCells.map(c => c.romaji).join('');

    currentQuestion = {
        jp: combinedJP,
        romaji: combinedRomaji,
        chars: selectedCells
    };

    document.querySelector("#question-output").textContent = combinedJP;
}



let AccuracyUploadTimeout;

function scheduleAccuracyUpload() {
    clearTimeout(AccuracyUploadTimeout);
    AccuracyUploadTimeout = setTimeout(() => {
        const hiragana_accuracy_list = JSON.stringify(compressAccuracyData(AccHiraganaList, hiraganaList));
        const katakana_accuracy_list = JSON.stringify(compressAccuracyData(AccKatakanaList, katakanaList));

        try {
            localStorage.setItem("hiragana_accuracy_list", hiragana_accuracy_list);
            localStorage.setItem("katakana_accuracy_list", katakana_accuracy_list);

            // Calculate total size in bytes
            const totalBytes =
                new Blob([hiragana_accuracy_list]).size +
                new Blob([katakana_accuracy_list]).size;

            const totalKB = (totalBytes / 1024).toFixed(2);
            console.log(`Accuracy lokal gespeichert (${totalKB} KB)`);
        } catch (e) {
            console.warn("Fehler beim lokalen Speichern:", e);
        }
    }, 5000); // 5 Sekunden Verzögerung
}


window.addEventListener("visibilitychange", () => {
    const hiragana_accuracy_list = JSON.stringify(compressAccuracyData(AccHiraganaList, hiraganaList));
    const katakana_accuracy_list = JSON.stringify(compressAccuracyData(AccKatakanaList, katakanaList));
    try {
        localStorage.setItem("hiragana_accuracy_list", hiragana_accuracy_list);
        localStorage.setItem("katakana_accuracy_list", katakana_accuracy_list);

        // Calculate total size in bytes
        const totalBytes =
            new Blob([hiragana_accuracy_list]).size +
            new Blob([katakana_accuracy_list]).size;

        const totalKB = (totalBytes / 1024).toFixed(2);

        console.log(`Accuracy lokal gespeichert (${totalKB} KB)`);
    } catch (e) {
        console.warn("Fehler beim lokalen Speichern:", e);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    let total_hiragana_count = 0;
    let total_katakana_count = 0;

    // Lade lokale Accuracy-Listen
    const hiraganaData = localStorage.getItem("hiragana_accuracy_list");
    const katakanaData = localStorage.getItem("katakana_accuracy_list");

    if (hiraganaData) {
        try {
            AccHiraganaList = decompressAccuracyData(JSON.parse(hiraganaData), hiraganaList);

            const hiraganaRows = document.querySelectorAll('#hiragana-table tbody tr');
            hiraganaRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    const romajiEl = cell.querySelector('.rom');
                    const progressBar = cell.querySelector('.progress');
                    if (!romajiEl || !progressBar) return;

                    const romajiRaw = romajiEl.textContent.toUpperCase();
                    const romaji = romajiRaw.split(' ')[0];

                    if (AccHiraganaList[romaji]) {
                        const { last10_correct } = AccHiraganaList[romaji];
                        const accuracy = last10_correct.reduce((a, b) => a + b, 0) / 10;
                        progressBar.style.setProperty("--progress-width", Math.round(accuracy * 100) + "%");
                        cell.classList.toggle("filled", accuracy === 1);
                    }
                });
            });

            const hiraganaDakuonRows = document.querySelectorAll('#hiragana-dakuon-table tbody tr');
            hiraganaDakuonRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    const romajiEl = cell.querySelector('.rom');
                    const progressBar = cell.querySelector('.progress');
                    if (!romajiEl || !progressBar) return;

                    const romajiRaw = romajiEl.textContent.toUpperCase();
                    const romaji = romajiRaw.split(' ')[0];

                    if (AccHiraganaList[romaji]) {
                        const { last10_correct } = AccHiraganaList[romaji];
                        const accuracy = last10_correct.reduce((a, b) => a + b, 0) / 10;
                        progressBar.style.setProperty("--progress-width", Math.round(accuracy * 100) + "%");
                        cell.classList.toggle("filled", accuracy === 1);
                    }
                });
            });

            total_hiragana_count = Object.values(AccHiraganaList).reduce((sum, entry) => sum + (entry.times_learned || 0), 0);
        } catch (e) {
            console.warn("Fehler beim Laden von Hiragana Accuracy:", e);
        }
    }

    if (katakanaData) {
        try {
            AccKatakanaList = decompressAccuracyData(JSON.parse(katakanaData), katakanaList);

            const katakanaRows = document.querySelectorAll('#katakana-table tbody tr');
            katakanaRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    const romajiEl = cell.querySelector('.rom');
                    const progressBar = cell.querySelector('.progress');
                    if (!romajiEl || !progressBar) return;

                    const romajiRaw = romajiEl.textContent.toUpperCase();
                    const romaji = romajiRaw.split(' ')[0];

                    if (AccKatakanaList[romaji]) {
                        const { last10_correct } = AccKatakanaList[romaji];
                        const accuracy = last10_correct.reduce((a, b) => a + b, 0) / 10;
                        progressBar.style.setProperty("--progress-width", Math.round(accuracy * 100) + "%");
                        cell.classList.toggle("filled", accuracy === 1);
                    }
                });
            });

            const katakanaDakuonRows = document.querySelectorAll('#katakana-dakuon-table tbody tr');
            katakanaDakuonRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    const romajiEl = cell.querySelector('.rom');
                    const progressBar = cell.querySelector('.progress');
                    if (!romajiEl || !progressBar) return;

                    const romajiRaw = romajiEl.textContent.toUpperCase();
                    const romaji = romajiRaw.split(' ')[0];

                    if (AccKatakanaList[romaji]) {
                        const { last10_correct } = AccKatakanaList[romaji];
                        const accuracy = last10_correct.reduce((a, b) => a + b, 0) / 10;
                        progressBar.style.setProperty("--progress-width", Math.round(accuracy * 100) + "%");
                        cell.classList.toggle("filled", accuracy === 1);
                    }
                });
            });

            total_katakana_count = Object.values(AccKatakanaList).reduce((sum, entry) => sum + (entry.times_learned || 0), 0);
        } catch (e) {
            console.warn("Fehler beim Laden von Katakana Accuracy:", e);
        }
    }

    console.log("Accuracy lokal geladen:", AccHiraganaList, `Learned: ${total_hiragana_count}`, AccKatakanaList, `Learned: ${total_katakana_count}`);

    // Lade Tabellenzustand (state)
    const table_state = localStorage.getItem("table_state");
    if (table_state) {
        try {
            applyActiveCellsFromJSON(table_state);
        } catch (e) {
            console.warn("Fehler beim Anwenden des Tabellenzustands:", e);
        }
    }

    // Lade erste Frage
    newQuestion();
});






document.addEventListener("DOMContentLoaded", () => {
    const user_input = document.querySelector("#user-input");

    user_input.addEventListener("input", (e) => {
        const input = e.target.value.toUpperCase();

        if (!currentQuestion) return;

        if (input.length === currentQuestion.romaji.length) {
            const isCorrect = input === currentQuestion.romaji;

            console.log(`Input: ${input}, Expected: ${currentQuestion.romaji}, Correct: ${isCorrect}`);

            // Nur beim ersten Versuch zählen
            if (!got_wrong) {
                totalCount++;

                currentQuestion.chars.forEach((charData) => {
                    const accList = charData.type === "Hiragana" ? AccHiraganaList : AccKatakanaList;
                    accList[charData.romaji].times_learned++;
                });
            }

            if (isCorrect) {
                playRandomCorrectSound();

                if (!got_wrong) {
                    currentQuestion.chars.forEach((charData) => {
                        const accList = charData.type === "Hiragana" ? AccHiraganaList : AccKatakanaList;
                        accList[charData.romaji].times_correct++;
                        accList[charData.romaji].last10_correct.shift();
                        accList[charData.romaji].last10_correct.push(1);
                    });

                    updateProgressBars();
                }

                got_wrong = false;
                got_wrong_count = 0;
                user_input.value = "";
                newQuestion();
            } else {
                playWrongSound();

                if (!got_wrong) {
                    currentQuestion.chars.forEach((charData) => {
                        const accList = charData.type === "Hiragana" ? AccHiraganaList : AccKatakanaList;
                        accList[charData.romaji].last10_correct.shift();
                        accList[charData.romaji].last10_correct.push(0);
                    });

                    updateProgressBars();
                }

                got_wrong = true;
                got_wrong_count++;

                if (got_wrong_count >= hint_c) {
                    const answerEl = document.getElementById("correct-answer");
                    if (!currentQuestion) return;

                    answerEl.textContent = currentQuestion.romaji;
                    answerEl.style.opacity = 1;

                    setTimeout(() => {
                        answerEl.style.opacity = 0;
                        setTimeout(() => {
                            answerEl.textContent = "";
                        }, 250)
                    }, 1750);
                }

                user_input.value = "";
            }
        }
    });
});



function updateProgressBars() {
    currentQuestion.chars.forEach((charData) => {
        const accList = charData.type === "Hiragana" ? AccHiraganaList : AccKatakanaList;
        let accuracy = accList[charData.romaji].last10_correct.reduce((a, b) => a + b, 0) / 10;
        accuracy = Math.round(accuracy * 100);

        const progressBar = charData.progress;
        if (progressBar) {
            progressBar.style.setProperty("--progress-width", accuracy + "%");
            if (accuracy === 100) {
                charData.element.classList.add("filled");
            } else {
                charData.element.classList.remove("filled");
            }
        }
    });
}


// hiragana table state database saving / loading <<< start

// save
function getActiveCellsAsJSON() {
    const rows = document.querySelectorAll('.char-table tbody tr');
    const activePositions = [];

    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, colIndex) => {
            if (cell.classList.contains('active')) {
                activePositions.push({ row: rowIndex, col: colIndex });
            }
        });
    });

    return JSON.stringify(activePositions);
}

let StateUploadTimeout;

function scheduleStateUpload() {
    clearTimeout(StateUploadTimeout);
    StateUploadTimeout = setTimeout(() => {
        const table_state = getActiveCellsAsJSON();
        try {
            localStorage.setItem("table_state", table_state);
            console.log("Tabellenzustand lokal gespeichert");
        } catch (e) {
            console.warn("Fehler beim Speichern des Tabellenzustands:", e);
        }
    }, 5000); // 5 Sekunden Verzögerung
}

document.addEventListener("DOMContentLoaded", function () {
    const cells = document.querySelectorAll(".char-table td");

    cells.forEach(cell => {
        // Überprüfen, ob die Zelle leer ist
        if (cell.textContent.trim() !== "") {
            // Wenn die Zelle nicht leer ist, füge den Event-Listener hinzu
            cell.addEventListener("click", function () {
                cell.classList.toggle("active");
                scheduleStateUpload()
            });
        }
    });
});


// load
function applyActiveCellsFromJSON(jsonString) {
    const activePositions = JSON.parse(jsonString);
    const rows = document.querySelectorAll('.char-table tbody tr');

    // Erst alle aktiven entfernen
    rows.forEach(row => {
        row.querySelectorAll('td').forEach(cell => {
            cell.classList.remove('active');
        });
    });

    // Dann gespeicherte aktivieren
    activePositions.forEach(pos => {
        const row = rows[pos.row];
        if (row) {
            const cell = row.querySelectorAll('td')[pos.col];
            if (cell) {
                cell.classList.add('active');
            }
        }
    });
}

// document.addEventListener("DOMContentLoaded", function () {
//     fetch("database_api.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "load-table-state" })
//     })
//         .then(res => res.json())
//         .then(data => {
//             if (data.status === "success" && data.table_state) {
//                 applyActiveCellsFromJSON(data.table_state);
//                 // load first jp to questrion ...
//                 newQuestion();
//             }
//         });
// });

// hiragana table state database saving / loading <<< end

function playRandomCorrectSound() {
    if (!playSounds) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    fetch('sounds/correct.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Leicht zufällige Abweichung in der Tonhöhe (z. B. 0.95 – 1.05)
            const randomPitch = 0.95 + Math.random() * 0.1;
            source.playbackRate.value = randomPitch;

            source.connect(audioContext.destination);
            source.start();
        })
        .catch(error => console.error('Fehler beim Laden der Audiodatei:', error));
}

function playWrongSound() {
    if (!playSounds) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    fetch('sounds/correct.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // Leicht zufällige Abweichung in der Tonhöhe (z. B. 0.95 – 1.05)
            const randomPitch = 0.25 + Math.random() * 0.1;
            source.playbackRate.value = randomPitch;

            source.connect(audioContext.destination);
            source.start();
        })
        .catch(error => console.error('Fehler beim Laden der Audiodatei:', error));
}


document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.sel_box').forEach(box => {
        box.addEventListener('click', () => {
            document.querySelectorAll('.sel_box').forEach(el => el.classList.remove('active_selection'));
            box.classList.add('active_selection');


            const h1Text = box.querySelector('h1').textContent;
            console.log("Aktive Auswahl:", h1Text);
        });
    });
})


function toggleSelection(selected) {
    // Alle Sektionen ausblenden und die "visible"-Klasse entfernen
    const sections = document.querySelectorAll('.table-section');
    sections.forEach(section => {
        section.classList.remove('visible');
    });

    // Alle Auswahlboxen deaktivieren
    const selectionBoxes = document.querySelectorAll('.sel_box');
    selectionBoxes.forEach(box => {
        box.classList.remove('active_selection');
    });

    // Die ausgewählte Sektion sichtbar machen
    const selectedSection = document.querySelector(`.${selected}`);
    selectedSection.classList.add('visible');

    // Die ausgewählte Box aktivieren
    const activeBox = document.querySelector(`.select_${selected}`);
    activeBox.classList.add('active_selection');
}



// Beim Laden der Seite die Standard-Selektion (Hiragana) aktivieren
window.onload = function () {
    toggleSelection('hiragana');
};


let last_opened = false

window.visualViewport.addEventListener("resize", () => {
    const keyboardHeight = window.innerHeight - window.visualViewport.height;

    document.documentElement.style.setProperty(
        "--keyboard-height",
        keyboardHeight + "px"
    );

    // Tastatur erkannt, wenn Höhe stark schrumpft (typisch < 80 %)
    if (keyboardHeight > 100) {
        if (!last_opened) {
            last_opened = true

            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth" // für sanftes Scrollen
                });
            }, 100);
        }
        document.documentElement.classList.add("keyboard-open");
    } else {
        last_opened = false
        document.documentElement.classList.remove("keyboard-open");
    }

    document.documentElement.style.setProperty(
        "--vvh",
        window.visualViewport.height + "px"
    );



});

document.addEventListener("DOMContentLoaded", () => {
    // Slider-Referenz
    const slider = document.querySelector("#chars-slider");
    const countDisplay = document.querySelector("#slider-value");
    const questionParagraph = document.querySelector('.question p');

    // Initialwert anzeigen
    countDisplay.textContent = charsPerQuestion;

    // Event-Listener für den Slider
    slider.addEventListener("input", () => {
        charsPerQuestion = parseInt(slider.value, 10);
        if (charsPerQuestion == 4) {
            questionParagraph.style.fontSize = '5.5rem';
        } else if (charsPerQuestion == 5) {
            questionParagraph.style.fontSize = '4.5rem';
        } else {
            questionParagraph.style.fontSize = '8rem';
        }
        countDisplay.textContent = charsPerQuestion;

        newQuestion();
    });


    // Bias-Slider-Handling
    const biasSlider = document.getElementById("bias-slider");
    const biasValueDisplay = document.getElementById("bias-value");

    biasSlider.addEventListener("input", (e) => {
        bias = Number(e.target.value);
        biasValueDisplay.textContent = bias;
    });


    // Hint-Slider-Handling
    const hintSlider = document.getElementById("hint-slider");
    const hintValueDisplay = document.getElementById("hint-value");

    hintSlider.addEventListener("input", (e) => {
        hint_c = Number(e.target.value);
        hintValueDisplay.textContent = hint_c;
    });

});
