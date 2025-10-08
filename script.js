document.addEventListener('DOMContentLoaded', () => {
    const inputScreen = document.getElementById('input-screen');
    const countdownScreen = document.getElementById('countdown-screen');
    const lotteryScreen = document.getElementById('lottery-screen');

    const deathForm = document.getElementById('death-form');
    const birthdateInput = document.getElementById('birthdate');

    const startOverBtn = document.getElementById('start-over-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    
    const timeElements = {
        years: document.getElementById('years'),
        months: document.getElementById('months'),
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
    };
    const endMessage = document.getElementById('end-message');

    const lotteryNumbersContainer = document.getElementById('lottery-numbers');

    let countdownInterval;

    const getRunCount = () => {
        const count = parseInt(localStorage.getItem('deathClockRuns') || '0', 10);
        localStorage.setItem('deathClockRuns', count + 1);
        return count + 1;
    };
    
    const calculateDeathDate = (birthdate) => {
        const runCount = getRunCount();
        const now = new Date();

        // Very long guess every 15 times
        if (runCount % 15 === 0) {
            const extraSeconds = 2_000_000_000 + Math.random() * 500_000_000;
            return new Date(now.getTime() + extraSeconds * 1000);
        }

        // Very short guess (small chance)
        if (Math.random() < 0.1) {
            const extraSeconds = 100_000 + Math.random() * 200_000; // ~1 to 3.5 days
            return new Date(now.getTime() + extraSeconds * 1000);
        }

        // "Normal" exaggerated guess
        const userAge = (now - new Date(birthdate)) / (1000 * 60 * 60 * 24 * 365.25);
        const deathAge = 35 + Math.random() * 60; // Dies between 35 and 95
        
        let deathDate = new Date(birthdate);
        deathDate.setFullYear(deathDate.getFullYear() + Math.floor(deathAge));
        deathDate.setMonth(deathDate.getMonth() + (deathAge % 1) * 12);

        // If calculated date is in the past, set it to some point in the next year
        if (deathDate < now) {
            deathDate = new Date(now.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 365);
        }

        return deathDate;
    };

    const startCountdown = (endDate) => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        const updateTimer = () => {
            const now = new Date();
            if (endDate <= now) {
                clearInterval(countdownInterval);
                Object.values(timeElements).forEach(el => el.textContent = '0');
                endMessage.classList.remove('hidden');
                return;
            }

            let future = new Date(endDate);
            let tempNow = new Date();

            let years = future.getFullYear() - tempNow.getFullYear();
            let months = future.getMonth() - tempNow.getMonth();
            let days = future.getDate() - tempNow.getDate();
            let hours = future.getHours() - tempNow.getHours();
            let minutes = future.getMinutes() - tempNow.getMinutes();
            let seconds = future.getSeconds() - tempNow.getSeconds();

            if (seconds < 0) { seconds += 60; minutes--; }
            if (minutes < 0) { minutes += 60; hours--; }
            if (hours < 0) { hours += 24; days--; }
            if (days < 0) {
                tempNow.setMonth(tempNow.getMonth() + 1, 0); // set to last day of previous month
                days += tempNow.getDate();
                months--;
            }
            if (months < 0) { months += 12; years--; }
            
            timeElements.years.textContent = years;
            timeElements.months.textContent = months;
            timeElements.days.textContent = days;
            timeElements.hours.textContent = hours;
            timeElements.minutes.textContent = minutes;
            timeElements.seconds.textContent = seconds;
        };

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    };

    const generateLotteryNumbers = () => {
        const numbers = new Set();
        while (numbers.size < 6) {
            const num = Math.floor(Math.random() * 69) + 1;
            numbers.add(num);
        }
        
        lotteryNumbersContainer.innerHTML = '';
        [...numbers].forEach(num => {
            const numEl = document.createElement('div');
            numEl.className = 'lottery-number';
            numEl.textContent = num;
            lotteryNumbersContainer.appendChild(numEl);
        });
    };

    deathForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const birthdate = birthdateInput.value;
        if (!birthdate) {
            alert('Please enter your birthdate.');
            return;
        }

        const deathDate = calculateDeathDate(birthdate);
        
        inputScreen.classList.add('hidden');
        countdownScreen.classList.remove('hidden');
        lotteryScreen.classList.add('hidden');
        endMessage.classList.add('hidden');

        startCountdown(deathDate);
    });

    startOverBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        generateLotteryNumbers();
        countdownScreen.classList.add('hidden');
        lotteryScreen.classList.remove('hidden');
    });
    
    tryAgainBtn.addEventListener('click', () => {
        lotteryScreen.classList.add('hidden');
        inputScreen.classList.remove('hidden');
        deathForm.reset();
    });
});

