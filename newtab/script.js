/*
==========================================
|- Louisiana State Holiday Calculations -|
==========================================
*/

import { getElement, qsa, cEl } from "../assets/utils.js"

//#region Module-Level Declarations
// Constants and configuration
const currentYear = new Date().getFullYear();
//Add one-off declared holidays here as needed: { name: 'Example', date: new Date(year, month, day) }
// Bump the version number in the localStorage cache key in the DOMContentLoaded block when modified
/**
 * @type {Array<{name: string, date: Date}>}
 */
const EXTRA_HOLIDAYS = [];
const CALENDAR_EVENTS = [
    {
        id: 'static-1',
        title: 'LSP Section Meeting',
        category: 'meeting',
        recurring: true,
        recurringDay: 4
    }
];
const dNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const wc = {
    '0': 'clear skies',
    '1': 'mainly clear',
    '2': 'partly cloudy',
    '3': 'overcast',
    '4': 'visibility reduced by smoke',
    '5': 'haze',
    '6': 'widespread dust',
    '7': 'dust or sand raised by wind',
    '8': 'dust whirls',
    '9': 'duststorm or sandstorm',
    '10': 'mist',
    '11': 'shallow fog patches',
    '12': 'continuous shallow fog',
    '13': 'lightning visible, no thunder',
    '14': 'precipitation not reaching ground',
    '15': 'distant precipitation',
    '16': 'nearby precipitation',
    '17': 'thunderstorm, no precipitation',
    '18': 'squalls',
    '19': 'funnel cloud',
    '20': 'drizzle or snow grains (past hour)',
    '21': 'rain (past hour)',
    '22': 'snow (past hour)',
    '23': 'rain and snow (past hour)',
    '24': 'freezing drizzle or rain (past hour)',
    '25': 'rain showers (past hour)',
    '26': 'snow showers (past hour)',
    '27': 'hail showers (past hour)',
    '28': 'fog or ice fog (past hour)',
    '29': 'thunderstorm (past hour)',
    '30': 'slight duststorm, decreasing',
    '31': 'slight duststorm, no change',
    '32': 'slight duststorm, increasing',
    '33': 'severe duststorm, decreasing',
    '34': 'severe duststorm, no change',
    '35': 'severe duststorm, increasing',
    '36': 'slight low drifting snow',
    '37': 'heavy low drifting snow',
    '38': 'slight high blowing snow',
    '39': 'heavy high blowing snow',
    '40': 'fog at a distance',
    '41': 'fog in patches',
    '42': 'fog, thinning, sky visible',
    '43': 'fog, thinning, sky invisible',
    '44': 'fog, no change, sky visible',
    '45': 'fog, no change, sky invisible',
    '46': 'fog, thickening, sky visible',
    '47': 'fog, thickening, sky invisible',
    '48': 'freezing fog, sky visible',
    '49': 'freezing fog, sky invisible',
    '50': 'slight intermittent drizzle',
    '51': 'slight continuous drizzle',
    '52': 'moderate intermittent drizzle',
    '53': 'moderate continuous drizzle',
    '54': 'heavy intermittent drizzle',
    '55': 'heavy continuous drizzle',
    '56': 'slight freezing drizzle',
    '57': 'moderate or heavy freezing drizzle',
    '58': 'slight drizzle and rain',
    '59': 'moderate or heavy drizzle and rain',
    '60': 'slight intermittent rain',
    '61': 'slight continuous rain',
    '62': 'moderate intermittent rain',
    '63': 'moderate continuous rain',
    '64': 'heavy intermittent rain',
    '65': 'heavy continuous rain',
    '66': 'slight freezing rain',
    '67': 'moderate or heavy freezing rain',
    '68': 'slight rain and snow',
    '69': 'moderate or heavy rain and snow',
    '70': 'slight intermittent snowfall',
    '71': 'slight continuous snowfall',
    '72': 'moderate intermittent snowfall',
    '73': 'moderate continuous snowfall',
    '74': 'heavy intermittent snowfall',
    '75': 'heavy continuous snowfall',
    '76': 'diamond dust',
    '77': 'snow grains',
    '78': 'snow crystals',
    '79': 'ice pellets',
    '80': 'slight rain showers',
    '81': 'moderate or heavy rain showers',
    '82': 'violent rain showers',
    '83': 'slight rain and snow showers',
    '84': 'moderate or heavy rain and snow showers',
    '85': 'slight snow showers',
    '86': 'moderate or heavy snow showers',
    '87': 'slight snow pellet showers',
    '88': 'moderate or heavy snow pellet showers',
    '89': 'slight hail showers',
    '90': 'moderate or heavy hail showers',
    '91': 'slight rain, recent thunderstorm',
    '92': 'moderate or heavy rain, recent thunderstorm',
    '93': 'slight snow or mixed, recent thunderstorm',
    '94': 'moderate or heavy snow or mixed, recent thunderstorm',
    '95': 'slight or moderate thunderstorm with rain or snow',
    '96': 'slight or moderate thunderstorm with hail',
    '97': 'heavy thunderstorm with rain or snow',
    '98': 'thunderstorm with duststorm',
    '99': 'heavy thunderstorm with hail'
};
const WORK_TIME = 25;
const BREAK_TIME = 5;
const today = new Date();

// DOM References
const addBtn = getElement('addBtn');
const item = getElement('item')
const place = getElement('place');
const filter = getElement('filter');
const timerBtn = getElement('timerBtn');
const resetBtn = getElement('resetBtn');
const notepad = getElement('notes');

// State variables
let isRunning = false;
let timeLeft = 0;
let isBreak = false;
/**
 * @type {number | null | undefined}
 */
let timeInterval = null;
let intervalCount = 0;
//#endregion

//#region Holiday calculation functions
/* Meeus/Jones/Butcher algorithm for calculating Easter Sunday
   Variables a-m are intermediate values defined by the algorithm -- DO NOT MODIFY */
/**
 * @param {number} year
 */
function getEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
};

/**
 * @param {number} year
 */
function getGoodFriday(year) {
    const easter = getEaster(year);
    return new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 2);
};

/**
 * @param {number} year
 */
function getMardiGras(year) {
    const easter = getEaster(year);
    return new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() - 47);
};

/**
 * @param {number} year
 */
function getIndObs(year) {
    const ind = new Date(year, 6, 4);
    const indObs = new Date(ind);
    const dow = ind.getDay();
    
    if (dow === 6) {
        indObs.setDate(ind.getDate() - 1);
    } else if (dow === 0) {
        indObs.setDate(ind.getDate() + 1);
    };

    return indObs;
};

/**
 * @param {number} year
 */
function getEl(year) {
    // Election day only occurs every two years
    if (year % 2 !== 0) return null;
    
    const nov1 = new Date(year, 10, 1);
    const nov1Day = nov1.getDay();

    // Calculate the number of days until the first Monday in November
    const d2Mon = (1 - nov1Day + 7) % 7;
    const mon1 = new Date(year, 10, 1 + d2Mon);

    const el = new Date(mon1);
    el.setDate(mon1.getDate() + 1);

    return el;
};

/**
 * @param {number} year
 */
function getLaInaug(year) {
    // La. Inauguration Day every four years
    if (year % 4 !== 0) return null;

    const jan1 = new Date(year, 0, 1);
    const jan1Day = jan1.getDay();

    // Days until first Monday
    const d2Mon = (1 - jan1Day + 7) % 7;
    const mon1 = new Date(year, 0, 1 + d2Mon);

    // Second Monday = first Monday + 7 days
    const mon2 = new Date(mon1);
    mon2.setDate(mon1.getDate() + 7);

    return mon2;
};

/**
 * @param {number} year
 */
function getInaug(year) {
    if (year % 4 !== 0) {
        return null;
    } else {
        return new Date(year, 0, 20);
    };
};

/**
 * @param {number} year
 */
function getLundiGras(year) {
    const mardiGras = getMardiGras(year);
    return new Date(mardiGras.getFullYear(), mardiGras.getMonth(), mardiGras.getDate() - 1);
};

/**
 * @param {number} year
 */
function getAcadian(year) {
    const thanksgiving = getFloatingHoliday(year, 10, 4, 4);
    return new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 1);
};

// Helper function to get the date of a floating holiday
// Returns the date of a floating holiday
// month: 0-indexed (0=January), week: occurrence in month (1=first, -1=last), dayOfWeek: 0-indexed (0=Sunday)
/**
 * @param {number} year
 * @param {number} month
 * @param {number} week
 * @param {number} dayOfWeek
 */
function getFloatingHoliday(year, month, week, dayOfWeek) {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    let add = (dayOfWeek - day + 7) % 7 + (week - 1) * 7;

    // Adjust for the last occurrence of the month (week = -1)
    if (week === -1) {
        const tempDate = new Date(year, month + 1, 0); // Last day of the month
        add = tempDate.getDate() - (tempDate.getDay() - dayOfWeek + 7) % 7;
    }
    date.setDate(1 + add);
    return date;
};
//#endregion

//#region Holiday list generation
/**
 * Generate a list of Louisiana state holidays for a given year
 *
 * @param {number} year 
 * @returns {Array<{name: string, date: Date}>} 
 */
function getLaHolidayList(year) {
    if (!year) return [];

    const holidays = [];

    // Compute dates locally
    const mlkDay = getFloatingHoliday(year, 0, 3, 1);
    const goodFriday = getGoodFriday(year);
    const mardiGras = getMardiGras(year);
    const lundiGras = getLundiGras(year);
    const independenceDay = getIndObs(year);
    const electionDay = getEl(year);
    const laInaugurationDay = getLaInaug(year);
    const inaugurationDay = getInaug(year);
    const thanksgiving = getFloatingHoliday(year, 10, 4, 4);
    const acadianDay = getAcadian(year);
    const laborDay = getFloatingHoliday(year, 8, 1, 1);

    // Fixed-date holidays
    holidays.push({ name: 'New Year\'s Day', date: new Date(year, 0, 1) });
    holidays.push({ name: 'New Year\'s Morrow', date: new Date(year, 0, 2) });
    holidays.push({ name: 'Veterans Day', date: new Date(year, 10, 11) });
    holidays.push({ name: 'Christmas', date: new Date(year, 11, 25) });

    // Floating holidays
    holidays.push({ name: 'Martin Luther King Jr. Day', date: mlkDay });
    holidays.push({ name: 'Lundi Gras', date: lundiGras });
    holidays.push({ name: 'Mardi Gras', date: mardiGras });
    holidays.push({ name: 'Good Friday', date: goodFriday });
    holidays.push({ name: 'Independence Day', date: independenceDay });
    holidays.push({ name: 'Labor Day', date: laborDay });
    holidays.push({ name: 'Thanksgiving', date: thanksgiving });
    holidays.push({ name: 'Acadian Day', date: acadianDay });
    if (electionDay) holidays.push({ name: 'Election Day', date: electionDay });
    if (laInaugurationDay) holidays.push({ name: 'La. Inauguration Day', date: laInaugurationDay });
    if (inaugurationDay) holidays.push({ name: 'Inauguration Day', date: inaugurationDay });

    EXTRA_HOLIDAYS.forEach(h => {
        if (h.date.getFullYear() === year) holidays.push(h);
    });

    // Sort the holidays by date
    holidays.sort((a, b) => a.date - b.date);
    return holidays;
};
//#endregion

/*
=============================
|---Welcome to the Hearth---|
|-Rest Here, Weary Traveler-|
=============================
*/

//#region Function Declarations
function clock() {
    const date = new Date();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    const time = `${hour}:${minute}:${second}`;
    const clockEl = getElement('clock');

    clockEl.textContent = time;
};

// Clock
/**
 * Formats time information for a running clock
 * @param {string} timeString
 * @returns {string} Time as hh:mm:ss and 'AM' or 'PM' as appropriate
 */
function formatHour(timeString) {
    const parts = timeString.split('T');
    const time = parts[1];
    const strHr = time.split(':');
    const hrStr = strHr[0];
    const hr = parseInt(hrStr);

    if (hr === 0) {
        return '12 AM';
    } else if (hr > 0 && hr < 12) {
        return hr + ' AM';
    } else if (hr === 12) {
        return '12 PM';
    } else {
        return (hr - 12) + ' PM';
    };
};

// Result is the current date formatted '[day] • MMMM dddd, yyyy'
function currentDate() {
    const now = new Date();
    const day = now.getDay();
    const month = now.getMonth();
    const dd = now.getDate();
    const y = now.getFullYear();

    const d = dNames[day];
    const m = mNames[month];

    const today = `${d} • ${m} ${dd}, ${y}`;
    const t = getElement('date');

    t.textContent = today;
};

/* Retrieves a list of tasks from localStorage, creates list items 
for each task, and appends them to an unordered list */
function renderTasks() {       
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const list = getElement('todo');

    list.innerHTML = '';

    tasks.forEach((/** @type {{ done: boolean; text: string | null; createdAt: string, completedAt: string | null }} */ task, /** @type {string | number} */ index) => {
        const li = list.appendChild(cEl('li'));
        const box = li.appendChild(cEl('input'));
        const taskLabel = li.appendChild(cEl('span'));
        const created = task.createdAt ? new Date(task.createdAt.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
        const completed = task.completedAt ? new Date(task.completedAt.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--';
        box.type = 'checkbox';
        box.checked = task.done;
        taskLabel.textContent = task.text + ` (${created})`;

        if (task.done) {
            li.classList.add('done');
            taskLabel.textContent = task.text + ` (${completed})`
        };

        box.addEventListener('change', () =>{
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks[index].done = !tasks[index].done;
            tasks[index].done ? tasks[index].completedAt = new Date().toISOString().split('T')[0] : tasks[index].completedAt = null;
            saveTasks(tasks);
            renderTasks();
        })
    })
};

// Saves tasks to localStorage
/**
 * @param {{ done: boolean; text: string | null; createdAt: string }} task
 */
function saveTasks(task) {
    localStorage.setItem('tasks', JSON.stringify(task));
};

/* Takes value of task input, pushes it to an object with keys 'text' and 'done', 
calls saveTasks and renderTasks to commit the list of tasks and then add it to the list, 
and then resets the value of the input */
function todo() {
    const item = getElement('item');
    let task = { text: item.value, done: false, createdAt: new Date().toISOString().split('T')[0] };

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.push(task);
    saveTasks(tasks);
    renderTasks();
    
    item.value = '';
};

/* Filters the task list to remove the tasks with a 'done' value of true, 
saves to localStorage, and renders the list of outstanding tasks */
function clearCompleted() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const remain = tasks.filter((/** @type {{ done: Boolean; }} */ task) => !task.done);
    saveTasks(remain);
    renderTasks();
};

// Calendar Widget
function todayHoliday(holidayList, today) {
    const match = holidayList.find(h => isSameDay(h.date, today));
    return match ? match.name : null;
};

function renderHolidays(list) {
    const holidayList = (list || getLaHolidayList(currentYear)).concat(getLaHolidayList(currentYear + 1));
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextIndex = holidayList.findIndex(h => h.date >= todayNorm);
    const past = holidayList.slice(0, nextIndex);
    const lastPast = past.slice(-1);
    const next = holidayList.slice(nextIndex);
    todayHoliday(holidayList, todayNorm);

    const cal = getElement('hl');
    cal.innerHTML = '';
    const cl = cEl('') // WIP
};

// Weather Widget
/* Takes location input from user, fetches OpenMeteo API with the location data
and passes the lat and long from the location data back to OpenMeteo to retrieve
the forecast for that location*/
async function fetchWeather() {
    const location = getInputElement('location');
    let city = location.value;
    const loc = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

    try {
        const resp = await fetch(loc);
        if (!resp.ok) {
            throw new Error(`Response status: ${resp.status}`);
        }

        const res = await resp.json();

        const lat = res.results[0].latitude;
        const lon = res.results[0].longitude;
        const weather = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&timezone=auto`;

        const ans = await fetch(weather);
        if (!ans.ok) {
            throw new Error(`Response status: ${ans.status}`);
        }

        const data = await ans.json();
        renderWeather(data);

    } catch (e) {
        console.error(e.message);
    };
};

/* Pulls select weather data from the return of the forecast from OpenMeteo,
fills strings to list current temp, chance of precip, high/low temp,
and creates a six hour futurecast for temp and precip */
/**
 * @param {{ current_weather: { temperature: any; weathercode: any; }; daily: { temperature_2m_max: any[]; temperature_2m_min: any[]; precipitation_probability_max: any[]; }; hourly: { temperature_2m: string | any[]; precipitation_probability: string | any[]; time: string | any[]; }; }} data
 */
function renderWeather(data) {
    const currentHour = new Date().getHours();

    const temp = data.current_weather.temperature;
    const cond = data.current_weather.weathercode;
    const c = wc[cond];
    const high = data.daily.temperature_2m_max[0];
    const low = data.daily.temperature_2m_min[0];
    const precip = data.daily.precipitation_probability_max[0];
    const hrTemp = data.hourly.temperature_2m.slice(currentHour, currentHour + 6);
    const hrPrecip = data.hourly.precipitation_probability.slice(currentHour, currentHour + 6);
    const hrTime = data.hourly.time.slice(currentHour, currentHour + 6);

    let current = `Currently ${temp} degrees and ${c}.`;
    let daily = `Daytime high of ${high} with a nighttime low of ${low}. Chance of rain ${precip}%.`;

    const weatherCurrent = getElement('weather-current');
    const weatherDaily = getElement('weather-daily');

    weatherCurrent.textContent = current;
    weatherDaily.textContent = daily;

    const wHr = getElement('weather-hourly');
    wHr.innerHTML = '';

    hrTime.forEach((/** @type {number} */ time, /** @type {string | number} */ index) => {
        const fTime = formatHour(time);
        const hr = wHr.appendChild(cEl('div'));
        const tempSpan = hr.appendChild(cEl('span'));
        const temp = hr.appendChild(cEl('span'));
        const precip = hr.appendChild(cEl('span'));

        tempSpan.textContent = fTime;
        temp.textContent = hrTemp[index];
        precip.textContent = hrPrecip[index];
    });
};

/* Pomodoro Timer */
function updateDisplay() {
    let m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    let s = String(timeLeft % 60).padStart(2, '0');

    const timer = getElement('timer');
    timer.textContent = m + ':' + s;

    // const intervalEl = getElement('interval-count');
    // if (intervalEl) intervalEl.textContent = `${intervalCount} / 4`;
};

function startTimer() {
    timeLeft = WORK_TIME * 60;
    isRunning = true;
    timerBtn.textContent = 'Pause'

    timeInterval = setInterval(startInterval, 1000);
};

function startInterval() {
    --timeLeft;
    updateDisplay();
    if (timeLeft === 0) {
        clearInterval(timeInterval);
        if (!isBreak) {
            ++intervalCount;
        };
        isBreak = !isBreak;
        if (isBreak) {
            if (intervalCount === 4) {
                const longBreak = Math.floor(Math.random() * 16) + 15;
                timeLeft = longBreak * 60;
                intervalCount = 0;
            } else {
                timeLeft = BREAK_TIME * 60;
            };
        } else {
            timeLeft = WORK_TIME * 60;
        };
        timeInterval = setInterval(startInterval, 1000);
    };
};

function pauseTimer() {
    const tBtn = getElement('timerBtn');
    isRunning = false;
    clearInterval(timeInterval);
    timerBtn.textContent = 'Start';
};

function resetTimer() {
    clearInterval(timeInterval);
    isRunning = false;
    timeLeft = 0;
    isBreak = false;
    timeInterval = null;
    intervalCount = 0;
    updateDisplay();
    timerBtn.textContent = 'Start';
};

/* Notepad */
// Saves the content in the textarea to localStorage
/**
 * @param {string} note
 */
function saveNotes(note) {
    localStorage.setItem('notes', note);
};

// Retrieves 'notes' from localStorage and returns it in the textarea
function loadNotes() {
    const notes = localStorage.getItem('notes');
    const notepadEl = getElement('notes');
    if (notepadEl) {
        notepadEl.value = notes || '';
    }
};

/* Holidays and Appointments */
// Purges passed events
function runMonElim() {
    const todayStr = today.toISOString().split('T')[0];
    const elim = localStorage.getItem('elim');
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    if (today.getDay() === 1 && todayStr !== elim) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const rem = events.filter(event => new Date(event.date) >= startOfWeek);
        localStorage.setItem('events', JSON.stringify(rem));
        localStorage.setItem('elim', todayStr);
    };
};

// Finds and sets the next date for a recurring event
function getNextOccurrence(recurringDay) {
    const daysUntil = (recurringDay - today.getDay() + 7) % 7;
    const next = new Date(today);
    next.setDate(today.getDate() + daysUntil);
    return next;
};

// Builds a combined list of CALENDAR_EVENTS and user-added events
function getEvents() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const recurring = CALENDAR_EVENTS.map(event => ({
        ...event,
        date: getNextOccurrence(event.recurringDay).toISOString().split('T')[0]
    }));
    const calendar = [...recurring, ...events];
    calendar.sort((a, b) => a.date - b.date);
    return calendar;
};
//#endregion

//#region Function Calls and Event Listeners
clock();
setInterval(clock, 1000);

currentDate();
renderTasks();
loadNotes();

runMonElim();

addBtn.addEventListener('click', todo);
document.addEventListener("keydown", (event) => {
    if (document.activeElement === item && event.key === 'Enter') todo();
});
place.addEventListener('click', fetchWeather);
filter.addEventListener('click', clearCompleted);
timerBtn.addEventListener('click', () => {
    if (isRunning === false) {
        startTimer();
    } else {
        pauseTimer();
    }
});
resetBtn.addEventListener('click', resetTimer);
notepad.addEventListener('input', () => saveNotes(notepad.value));
//#endregion