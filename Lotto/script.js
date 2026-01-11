// DOM 요소 가져오기
const generateBtn = document.getElementById('generateBtn');
const numbersDisplay = document.getElementById('numbersDisplay');
const historyList = document.getElementById('historyList');

// 로또 번호 생성 함수 (1~45 중 중복 없이 6개)
function generateLottoNumbers() {
    const numbers = [];

    // 1~45 배열 생성
    const pool = Array.from({ length: 45 }, (_, i) => i + 1);

    // Fisher-Yates shuffle 알고리즘으로 6개 뽑기
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        numbers.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }

    // 오름차순 정렬
    return numbers.sort((a, b) => a - b);
}

// 번호에 따른 공 색상 클래스 반환
function getBallColorClass(number) {
    if (number >= 1 && number <= 10) return 'ball-yellow';
    if (number >= 11 && number <= 20) return 'ball-blue';
    if (number >= 21 && number <= 30) return 'ball-red';
    if (number >= 31 && number <= 40) return 'ball-gray';
    if (number >= 41 && number <= 45) return 'ball-green';
}

// 번호를 화면에 표시하는 함수
function displayNumbers(numbers) {
    // 기존 내용 지우기
    numbersDisplay.innerHTML = '';

    // 각 번호를 공 모양으로 표시 (애니메이션 딜레이 추가)
    numbers.forEach((number, index) => {
        const ball = document.createElement('div');
        ball.className = `lotto-ball ${getBallColorClass(number)}`;
        ball.textContent = number;
        ball.style.animationDelay = `${index * 0.1}s`;
        numbersDisplay.appendChild(ball);
    });
}

// 현재 시간을 포맷팅하는 함수
function formatTime() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${month}/${date} ${hours}:${minutes}`;
}

// 기록에 저장하는 함수
function saveToHistory(numbers) {
    // localStorage에서 기존 기록 가져오기
    let history = JSON.parse(localStorage.getItem('lottoHistory')) || [];

    // 새 기록 추가
    const newEntry = {
        numbers: numbers,
        timestamp: new Date().toISOString(),
        displayTime: formatTime()
    };

    // 최신 기록을 맨 앞에 추가
    history.unshift(newEntry);

    // 최대 10개까지만 유지
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    // localStorage에 저장
    localStorage.setItem('lottoHistory', JSON.stringify(history));

    // 화면 업데이트
    displayHistory();
}

// 기록을 화면에 표시하는 함수
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('lottoHistory')) || [];
    const clearAllBtn = document.getElementById('clearAllBtn');

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">아직 생성된 번호가 없습니다</p>';
        clearAllBtn.classList.add('hidden');
        return;
    }

    clearAllBtn.classList.remove('hidden');
    historyList.innerHTML = '';

    history.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-content';

        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'history-numbers';

        entry.numbers.forEach(number => {
            const ball = document.createElement('div');
            ball.className = `history-ball ${getBallColorClass(number)}`;
            ball.textContent = number;
            numbersDiv.appendChild(ball);
        });

        const timeDiv = document.createElement('div');
        timeDiv.className = 'history-time';
        timeDiv.textContent = entry.displayTime;

        contentDiv.appendChild(numbersDiv);
        contentDiv.appendChild(timeDiv);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '✕';
        deleteBtn.title = '삭제';
        deleteBtn.addEventListener('click', () => deleteHistoryItem(index));

        item.appendChild(contentDiv);
        item.appendChild(deleteBtn);
        historyList.appendChild(item);
    });
}

// 개별 기록 삭제 함수
function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('lottoHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('lottoHistory', JSON.stringify(history));
    displayHistory();
}

// 전체 기록 삭제 함수
function clearAllHistory() {
    if (confirm('모든 기록을 삭제하시겠습니까?')) {
        localStorage.removeItem('lottoHistory');
        displayHistory();
    }
}

// 사운드 효과 함수 (Web Audio API 사용)
function playSound() {
    try {
        // AudioContext 생성
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 3개의 톤을 조합하여 풍부한 소리 생성
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (메이저 코드)

        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine'; // 부드러운 사인파

            // 볼륨 설정 (각 톤마다 다르게)
            const initialVolume = index === 0 ? 0.3 : 0.15;
            gainNode.gain.setValueAtTime(initialVolume, audioContext.currentTime);

            // 페이드 아웃 효과
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            // 재생 시작 및 종료
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        });

    } catch (error) {
        console.log('사운드 재생을 지원하지 않는 브라우저입니다.');
    }
}

// 번호 생성 버튼 클릭 이벤트
generateBtn.addEventListener('click', () => {
    // 사운드 재생
    playSound();

    // 버튼 애니메이션
    generateBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        generateBtn.style.transform = 'scale(1)';
    }, 100);

    // 번호 생성
    const numbers = generateLottoNumbers();

    // 화면에 표시
    displayNumbers(numbers);

    // 기록에 저장
    saveToHistory(numbers);
});

// 페이지 로드 시 기록 표시
document.addEventListener('DOMContentLoaded', () => {
    displayHistory();

    // 전체 삭제 버튼 이벤트 리스너
    const clearAllBtn = document.getElementById('clearAllBtn');
    clearAllBtn.addEventListener('click', clearAllHistory);
});
