document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    const place = document.getElementById("place");
    const filter = document.getElementById("filter");
    const timerBtn = document.getElementById("timerBtn");
    const resetBtn = document.getElementById("resetBtn");
    const notepad = document.getElementById("notes");

    let isRunning = false;
    let timeLeft = 0;
    let isBreak = false;
    let timeInterval = null;

    const dNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const wc = {
        "0": "clear skies",
        "1": "mainly clear",
        "2": "partly cloudy",
        "3": "overcast",
        "4": "visibility reduced by smoke",
        "5": "haze",
        "6": "widespread dust",
        "7": "dust or sand raised by wind",
        "8": "dust whirls",
        "9": "duststorm or sandstorm",
        "10": "mist",
        "11": "shallow fog patches",
        "12": "continuous shallow fog",
        "13": "lightning visible, no thunder",
        "14": "precipitation not reaching ground",
        "15": "distant precipitation",
        "16": "nearby precipitation",
        "17": "thunderstorm, no precipitation",
        "18": "squalls",
        "19": "funnel cloud",
        "20": "drizzle or snow grains (past hour)",
        "21": "rain (past hour)",
        "22": "snow (past hour)",
        "23": "rain and snow (past hour)",
        "24": "freezing drizzle or rain (past hour)",
        "25": "rain showers (past hour)",
        "26": "snow showers (past hour)",
        "27": "hail showers (past hour)",
        "28": "fog or ice fog (past hour)",
        "29": "thunderstorm (past hour)",
        "30": "slight duststorm, decreasing",
        "31": "slight duststorm, no change",
        "32": "slight duststorm, increasing",
        "33": "severe duststorm, decreasing",
        "34": "severe duststorm, no change",
        "35": "severe duststorm, increasing",
        "36": "slight low drifting snow",
        "37": "heavy low drifting snow",
        "38": "slight high blowing snow",
        "39": "heavy high blowing snow",
        "40": "fog at a distance",
        "41": "fog in patches",
        "42": "fog, thinning, sky visible",
        "43": "fog, thinning, sky invisible",
        "44": "fog, no change, sky visible",
        "45": "fog, no change, sky invisible",
        "46": "fog, thickening, sky visible",
        "47": "fog, thickening, sky invisible",
        "48": "freezing fog, sky visible",
        "49": "freezing fog, sky invisible",
        "50": "slight intermittent drizzle",
        "51": "slight continuous drizzle",
        "52": "moderate intermittent drizzle",
        "53": "moderate continuous drizzle",
        "54": "heavy intermittent drizzle",
        "55": "heavy continuous drizzle",
        "56": "slight freezing drizzle",
        "57": "moderate or heavy freezing drizzle",
        "58": "slight drizzle and rain",
        "59": "moderate or heavy drizzle and rain",
        "60": "slight intermittent rain",
        "61": "slight continuous rain",
        "62": "moderate intermittent rain",
        "63": "moderate continuous rain",
        "64": "heavy intermittent rain",
        "65": "heavy continuous rain",
        "66": "slight freezing rain",
        "67": "moderate or heavy freezing rain",
        "68": "slight rain and snow",
        "69": "moderate or heavy rain and snow",
        "70": "slight intermittent snowfall",
        "71": "slight continuous snowfall",
        "72": "moderate intermittent snowfall",
        "73": "moderate continuous snowfall",
        "74": "heavy intermittent snowfall",
        "75": "heavy continuous snowfall",
        "76": "diamond dust",
        "77": "snow grains",
        "78": "snow crystals",
        "79": "ice pellets",
        "80": "slight rain showers",
        "81": "moderate or heavy rain showers",
        "82": "violent rain showers",
        "83": "slight rain and snow showers",
        "84": "moderate or heavy rain and snow showers",
        "85": "slight snow showers",
        "86": "moderate or heavy snow showers",
        "87": "slight snow pellet showers",
        "88": "moderate or heavy snow pellet showers",
        "89": "slight hail showers",
        "90": "moderate or heavy hail showers",
        "91": "slight rain, recent thunderstorm",
        "92": "moderate or heavy rain, recent thunderstorm",
        "93": "slight snow or mixed, recent thunderstorm",
        "94": "moderate or heavy snow or mixed, recent thunderstorm",
        "95": "slight or moderate thunderstorm with rain or snow",
        "96": "slight or moderate thunderstorm with hail",
        "97": "heavy thunderstorm with rain or snow",
        "98": "thunderstorm with duststorm",
        "99": "heavy thunderstorm with hail"
    };

    function clock() {
        const date = new Date();
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");

        const time = `${hour}:${minute}:${second}`;
        const clockEl = document.getElementById("clock");

        clockEl.textContent = time;
    };

    function currentDate() {
        const now = new Date();
        const day = now.getDay();
        const month = now.getMonth();
        const dd = now.getDate();
        const y = now.getFullYear();

        const d = dNames[day];
        const m = mNames[month];

        const today = `${d} · ${m} ${dd}, ${y}`;
        const t = document.getElementById("date");

        t.textContent = today;
    }

    function renderTasks() {       
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const list = document.getElementById("todo");

        list.innerHTML = "";

        tasks.forEach((task, index) => {
            const li = list.appendChild(document.createElement("li"));
            const box = li.appendChild(document.createElement("input"));
            const taskLabel = li.appendChild(document.createElement("span")); 
            box.type = "checkbox";
            box.checked = task.done;
            taskLabel.textContent = task.text;

            if (task.done) {
                li.classList.add("done");
            }

            box.addEventListener("change", () =>{
                const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
                tasks[index].done = !tasks[index].done;
                saveTasks(tasks);
                renderTasks();
            })
        })
    }

    function saveTasks(task) {
        localStorage.setItem("tasks", JSON.stringify(task));
    }

    function todo() {
        const item = document.getElementById("item");
        let task = { text: item.value, done: false };

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        tasks.push(task);
        saveTasks(tasks);
        renderTasks();
        
        document.getElementById("item").value = "";
    }

    async function fetchWeather() {
        const location = document.getElementById("location");
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
        }

    };

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

        const weatherCurrent = document.getElementById("weather-current");
        const weatherDaily = document.getElementById("weather-daily");

        weatherCurrent.textContent = current;
        weatherDaily.textContent = daily;

        const wHr = document.getElementById("weather-hourly");
        wHr.innerHTML = "";

        hrTime.forEach((time, index) => {
            const fTime = formatHour(time);
            const hr = wHr.appendChild(document.createElement("div"));
            const tempSpan = hr.appendChild(document.createElement("span"));
            const temp = hr.appendChild(document.createElement("span"));
            const precip = hr.appendChild(document.createElement("span"));

            tempSpan.textContent = fTime;
            temp.textContent = hrTemp[index];
            precip.textContent = hrPrecip[index];
        });
    };

    function formatHour(timeString) {
        const parts = timeString.split("T");
        const time = parts[1];
        const strHr = time.split(":");
        const hrStr = strHr[0];
        const hr = parseInt(hrStr);

        if (hr === 0) {
            return "12 AM";
        } else if (hr > 0 && hr < 12) {
            return hr + " AM";
        } else if (hr === 12) {
            return "12 PM";
        } else {
            return (hr - 12) + " PM";
        };
    };

    function clearCompleted() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const remain = tasks.filter(task => !task.done);
        saveTasks(remain);
        renderTasks();
    }

    function updateDisplay() {
        let m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
        let s = String(timeLeft % 60).padStart(2, "0");

        const timer = document.getElementById("timer");
        timer.textContent = m + ":" + s;
    }

    function startTimer() {
        const work = document.getElementById("work");
        timeLeft = parseInt(work.value) * 60;
        isRunning = true;
        timerBtn.textContent = "Pause"
    
        timeInterval = setInterval(startInterval, 1000);
    }

    function startInterval() {
        --timeLeft;
        updateDisplay();
        if (timeLeft === 0) {
            clearInterval(timeInterval); // This is the proper name; the var was declared as "timeInterval," so stop saying it is a typo.
            isBreak = !isBreak;
            if (isBreak) {
                timeLeft = parseInt(document.getElementById("break").value) * 60;
            } else {
                timeLeft = parseInt(document.getElementById("work").value) * 60;
            };
            timeInterval = setInterval(startInterval, 1000);
        };
    };

    function pauseTimer() {
        const tBtn = document.getElementById("timerBtn");
        isRunning = false;
        clearInterval(timeInterval);
        timerBtn.textContent = "Start";
    }

    function resetTimer() {
        clearInterval(timeInterval);
        isRunning = false;
        timeLeft = 0;
        isBreak = false;
        timeInterval = null;
        updateDisplay();
        timerBtn.textContent = "Start";
    }

    function saveNotes(note) {
        localStorage.setItem("notes", note);
    };

    function loadNotes() {
        const notes = localStorage.getItem("notes");
        notepad.value = notes;
    };

    clock();
    setInterval(clock, 1000);

    currentDate();
    renderTasks();
    loadNotes();

    addBtn.addEventListener("click", todo);
    place.addEventListener("click", fetchWeather);
    filter.addEventListener("click", clearCompleted);
    timerBtn.addEventListener("click", () => {
        if (isRunning === false) {
            startTimer();
        } else {
            pauseTimer();
        }
    });
    resetBtn.addEventListener("click", resetTimer);
    notepad.addEventListener("input", () => saveNotes(notepad.value));
});