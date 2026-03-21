document.addEventListener("DOMContentLoaded", () => {
    function clock() {
        const date = new Date();
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");

        const time = `${hour}:${minute}:${second}`;
        const t = document.getElementById("clock");

        t.textContent = time;
    };
            
    function currentDate() {
        const now = new Date();
        const day = now.getDay();
        const month = now.getMonth();
        const dd = now.getDate();
        const y = now.getFullYear();

        const dNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

    const todo_list = document.getElementById("btn");

    function todo() {
        const item = document.getElementById("item");
        let task = { text: item.value, done: false };

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        tasks.push(task);
        saveTasks(tasks);
        renderTasks();
        
        document.getElementById("item").value = "";
    }

    const place = document.getElementById("place");

    async function fetchWeather() {
        const location = document.getElementById("location");
        let city = location.value;
        const loc = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

        console.log(loc);

        try {
            const resp = await fetch(loc);
            if (!resp.ok) {
                throw new Error(`Response status: ${resp.status}`);
            }

            const res = await resp.json();
            console.log(res);

            const lat = res.results[0].latitude;
            const lon = res.results[0].longitude;
            const weather = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&timezone=auto`;
            console.log(weather);

            const ans = await fetch(weather);
            if (!ans.ok) {
                throw new Error(`Response status: ${ans.status}`);
            }

            const out = await ans.json();
            console.log(out);
            
        } catch (e) {
            console.error(e.message);
        }
    };

    const filter = document.getElementById("filter");

    function clearCompleted() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const remain = tasks.filter(task => !task.done);
        saveTasks(remain);
        renderTasks();
    }

    clock();
    setInterval(clock, 1000);

    currentDate();

    renderTasks();

    todo_list.addEventListener("click", todo);
    place.addEventListener("click", fetchWeather);
    filter.addEventListener("click", clearCompleted);
});