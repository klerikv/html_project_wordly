document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация игры
    const config = {
        wordLength: 5,
        maxAttempts: 6,
        isDarkTheme: localStorage.getItem('wordlyTheme') === 'true'
    };
    
    // Элементы интерфейса
    const elements = {
        input: document.getElementById('text'),
        checkBtn: document.getElementById('check'),
        restartBtn: document.getElementById('restart'),
        gameContainer: document.getElementById('gameContainer'),
        lengthSelect: document.getElementById('lengthSelect'),
        themeToggle: document.getElementById('themeToggle'),
        gameLog: document.getElementById('gameLog'),
        body: document.body
    };
    
    // Состояние игры
    const state = {
        targetWord: '',
        attempts: 0,
        gameOver: false,
        gameStartTime: null,
        history: JSON.parse(localStorage.getItem('wordlyHistory')) || []
    };
    
    // Слова для игры
    const wordLists = {
        4: ['МОРЕ', 'РЕКА', 'ЛУНА', 'ОКНО', 'СЛОН', 'ПРИЗ'],
        5: ['КРОНА', 'СТЕНА', 'МОТОР', 'СЛОВО', 'ПОЛИС', 'ВЕТЕР'],
        6: ['СОЛНЦЕ', 'ПОГОДА', 'ВАЛЮТА', 'БЕНЗИН', 'РАДУГА']
    };
    
    // Инициализация игры
    function initGame() {
        elements.gameContainer.innerHTML = '';
        elements.input.value = '';
        state.attempts = 0;
        state.gameOver = false;
        state.gameStartTime = new Date();
        
        // Выбор случайного слова
        state.targetWord = wordLists[config.wordLength][
            Math.floor(Math.random() * wordLists[config.wordLength].length)
        ].toUpperCase();

        console.log('Загаданное слово: ', state.targetWord);
        console.log();
        console.log('Список допустимых слов\n', wordLists[config.wordLength]);

        
        // Создание игрового поля
        for (let i = 0; i < config.maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            
            for (let j = 0; j < config.wordLength; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.innerHTML = '<div class="letter-container"></div>';
                row.appendChild(cell);
            }
            
            elements.gameContainer.appendChild(row);
        }
    }


    // Проверка слова
    function checkGuess() {
        if (state.gameOver) return;
        
        const guess = elements.input.value.toUpperCase().trim();
        
        // Проверка длины слова
        if (guess.length !== config.wordLength) {
            alert(`Введите слово из ${config.wordLength} букв!`);
            return;
        }

        //Проверка на кириллицу
        if (!new RegExp(`^[А-ЯЁ]{${config.wordLength}}$`, 'i').test(guess)) {
            alert('Пожалуйста, используйте только русские буквы');
            return;
        }


        // Проверка повтора букв
        let invalidPattern;
        if (config.wordLength <= 5) {
            invalidPattern = /(.)\1\1/; // 4-5 букв
        } else {
            invalidPattern = /(.)\1\1\1/; // 6 букв
        }

        if (invalidPattern.test(guess)) {
            const maxAllowed = config.wordLength <= 5 ? 3 : 4;
            alert(`Нельзя использовать ${maxAllowed} одинаковых буквы подряд!`);
            return;
        }


        /*
        //Слово из списка допустимых или нет
        if (!wordLists[config.wordLength].includes(guess)) {
            alert('Это слово не входит в список допустимых слов');
            return;
        }
        */

        const currentRow = elements.gameContainer.children[state.attempts];
        const letters = currentRow.querySelectorAll('.letter-container');
        
        // Анализ букв
        const targetLetters = state.targetWord.split('');
        const guessLetters = guess.split('');
        const result = Array(config.wordLength).fill('absent');
        
        // Проверка точных совпадений
        for (let i = 0; i < config.wordLength; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'correct';
                targetLetters[i] = null;
                guessLetters[i] = null;
            }
        }
        
        // Проверка наличия букв в слове
        for (let i = 0; i < config.wordLength; i++) {
            if (!guessLetters[i]) continue;
            
            const foundIndex = targetLetters.indexOf(guessLetters[i]);
            if (foundIndex !== -1) {
                result[i] = 'present';
                targetLetters[foundIndex] = null;
            }
        }
        
        // Отображение результата
        result.forEach((res, i) => {
            const letter = letters[i];
            letter.textContent = guess[i];
            letter.style.backgroundColor = `var(--letter-${res})`;
            letter.style.color = 'white';
            
            setTimeout(() => {
                letter.style.transform = 'scale(1.1)';
                setTimeout(() => letter.style.transform = 'scale(1)', 100);
            }, i * 100);
        });
        
        // Проверка победы
        if (guess === state.targetWord) {
            state.gameOver = true;
            currentRow.classList.add('celebrate');
            setTimeout(() => {
                alert('Поздравляем! Вы угадали слово!');
                recordGameResult(true);
            }, 1000);
            return;
        }
        
        state.attempts++;
        
        // Проверка поражения
        if (state.attempts >= config.maxAttempts) {
            state.gameOver = true;
            setTimeout(() => {
                alert(`Игра окончена. Загаданное слово: ${state.targetWord}`);
                recordGameResult(false);
            }, 300);
        }
        
        elements.input.value = '';
    }


    // Функция для отображения списков слов
    function displayWordLists() {
        // Для каждой группы слов создаем список
        for (const length in wordLists) {
            const container = document.getElementById(`words${length}`);
            if (!container) continue;

            // Сортируем слова по алфавиту
            const sortedWords = [...wordLists[length]].sort();

            // Создаем HTML для отображения слов
            container.innerHTML = sortedWords
                .map(word => `<span class="word-item">${word}</span>`)
                .join(' ');
        }
    }
    
    // Запись результата игры
    function recordGameResult(isWin) {
        const gameRecord = {
            date: state.gameStartTime.toLocaleString(),
            duration: Math.floor((new Date() - state.gameStartTime) / 1000) + ' сек',
            wordLength: config.wordLength,
            targetWord: state.targetWord,
            result: isWin ? 'Победа' : 'Поражение',
            attempts: state.attempts
        };
        
        state.history.push(gameRecord);
        localStorage.setItem('wordlyHistory', JSON.stringify(state.history));
        updateGameLog();
    }
    
    // Обновление истории игр
    function updateGameLog() {
        const logContent = elements.gameLog;
        //logContent.innerHTML = '<h3>История игр</h3>'; // Оставляем только заголовок

        if (!state.history.length) {
            logContent.innerHTML += '<p>Нет сохраненных игр</p>';
            return;
        }
        
        state.history.slice(-5).reverse().forEach(game => {
            const entry = document.createElement('div');
            entry.className = 'game-entry';
            entry.innerHTML = `
                <p><strong>${game.date}</strong> (${game.duration})</p>
                <p>Слово: ${game.targetWord} (${game.wordLength} букв)</p>
                <p>Результат: ${game.result} (попыток: ${game.attempts}/${config.maxAttempts})</p>
                <hr>
            `;
            elements.gameLog.appendChild(entry);
        });
    }
    
    // Переключение темы
    function toggleTheme() {
        config.isDarkTheme = !config.isDarkTheme;
        elements.body.classList.toggle('dark-theme', config.isDarkTheme);
        elements.themeToggle.textContent = config.isDarkTheme ? 'Светлая тема' : 'Тёмная тема';
        localStorage.setItem('wordlyTheme', config.isDarkTheme);
    }

    // Переключение видимости истории
    function toggleGameLog() {
        const log = elements.gameLog;
        const btn = document.getElementById('toggleHistory');

        if (log.style.display === 'none') {
            log.style.display = 'block';
            btn.textContent = 'Скрыть';
            updateGameLog(); // Обновляем данные при открытии
        } else {
            log.style.display = 'none';
            btn.textContent = 'Показать';
        }
    }


    // Инициализация интерфейса
    function initUI() {
        // Настройка темы
        if (config.isDarkTheme) {
            elements.body.classList.add('dark-theme');
            elements.themeToggle.textContent = 'Светлая тема';
        }
        
        // Обработчики событий
        elements.checkBtn.addEventListener('click', checkGuess);
        elements.restartBtn.addEventListener('click', initGame);
        elements.themeToggle.addEventListener('click', toggleTheme);
        elements.lengthSelect.addEventListener('change', () => {
            config.wordLength = parseInt(elements.lengthSelect.value);
            initGame();
        });
        
        elements.input.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                checkGuess();
            }
        });


        // Обработчик кнопки показа истории
        document.getElementById('toggleHistory').addEventListener('click', toggleGameLog);

        // Скрываем лог при загрузке
        elements.gameLog.style.display = 'none';
    }
    
    // Запуск игры
    initUI();
    initGame();
    displayWordLists();
});