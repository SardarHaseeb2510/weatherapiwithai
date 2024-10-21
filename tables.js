const apiKey = "da552f3f1766b44c27f0e2cd3538693b";

const weatherApiKey = "da552f3f1766b44c27f0e2cd3538693b";

const geminiApiKey = "AIzaSyD2_XEr7jVJTylQZ3I9wsJ6HSpWXkcYA4A";

const resultArea = document.getElementById("textareaForAi");

async function handleQuery() {
    const query = document.getElementById("searchForAi").value.toLowerCase();
    const textarea = document.getElementById("textareaForAi");
    if (query.includes("weather")) {
        textarea.value = "";
        let city = await getCityNameFromChatBot("Kindly extract the city name from the query, if city is present, only return that city name in one word, if city is not found, return null. Kinldy return only one word(city name or null). The query is " + query);
        console.log(city);
        getWeatherInfo(city, query);

    } else {

        textarea.value = "This chatbot is for weather based, kindly use weather in the keyword!"
    }
}


function adjustTextAreaHeight() {

    const textarea = document.getElementById("textareaForAi");
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

async function getWeatherInfo(city, query) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    
    try {
        // Fetch weather data
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        const weatherData = await weatherResponse.json();
        const forecastArray = getCityForcastData(weatherData.list); // Pass weather data to processing function
        console.log(JSON.stringify(forecastArray)); // Display processed forecast data

        // Create the body for Gemini API request
        
        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: query + ", this is the data where you have to respond the message: " + JSON.stringify(forecastArray)
                        }
                    ]
                }
            ]
        };

        const geminiResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const geminiData = await geminiResponse.json();

        // Process the returned data from Gemini
       

        const generatedText = geminiData.candidates[0].content.parts[0].text; 
        console.log(generatedText);
        resultArea.value = generatedText;
        adjustTextAreaHeight();

    } catch (error) {
        console.error("Error in fetching data:", error);
    }
}
function getCityForcastData(data) {
    let arr = [];
    
    data.forEach(element => {
        const [date, time] = element.dt_txt.split(' ');
        
        let list = {
            date: date,
            time: time,
            temp: element.main.temp,
            desc: element.weather[0].main
        };

        arr.push(list);
    });
    console.log(arr)
    return arr;
}

async function getCityNameFromChatBot(query) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    const body = {
        contents: [
            {
                parts: [
                    {
                        text: query
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Error calling the Gemini API:", error);
        return null;
    }
}


function getTablesData() {

    let cityName = document.getElementById("cityInput").value;
    let selectedWeatherDiv = document.getElementById("selectedWeather");

    if (!cityName) {
        let returnedValueForSelectedWeatherDiv = "<span>Kindly enter a valid city please</span>";
        selectedWeatherDiv.innerHTML = returnedValueForSelectedWeatherDiv;
        console.log(selectedWeatherDiv);
    }
    else {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(response => displayWeatherForecastInTheGivenTable(response))
            .catch(error => console.error('Error fetching forecast data:', error));
    }
}

function addButtonsForFilter() {
    let reqUsedFilters = document.getElementById("reqUsedFilters");
    reqUsedFilters.classList.remove("hidden");
}

function addFilters(val) {
    const city = document.getElementById("cityInput").value;

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(response => {
            let list = response.list;
            console.log('Original list:', list);

            // Apply filter/sorting based on the button clicked
            if (val === 1) {
                // Show temperatures in ascending order
                list.sort((a, b) => a.main.temp - b.main.temp);
            } else if (val === 2) {
                // Show temperatures in descending order
                list.sort((a, b) => b.main.temp - a.main.temp);
            } else if (val === 3) {
                // Filter out days without rain
                list = list.filter(item => item.weather[0].main.toLowerCase() === 'rain');
            } else if (val === 4) {
                // Show the day with the highest temperature
                list = [list.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current)];
            }

            // Call the function to display the filtered/sorted data
            displayWeatherForecastInTheGivenTable({ list });
        })
        .catch(error => console.error('Error fetching forecast data:', error));
}


let currentPage = 1;
const itemsPerPage = 10;

function displayWeatherForecastInTheGivenTable(response) {


    const tableForWeather = document.getElementById('tableForWeather');
    const pagination = document.getElementById('pagination');

    pagination.innerHTML = "";
    tableForWeather.innerHTML = "";

    let totalPages = Math.ceil(response.list.length / itemsPerPage);
    console.log('Total Pages:', totalPages);

    for (let i = 1; i <= totalPages; i++) {
        let button = document.createElement('button');

        button.className = 'bg-blue-600 text-white px-4 py-2 mx-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300';
        button.innerText = i;

        button.onclick = function () {
            currentPage = i;
            renderTableData(response.list);
            updateActiveButton(pagination, button);

        };

        pagination.appendChild(button);
    }

    renderTableData(response.list);
}

function updateActiveButton(pagination, activeButton) {
    const buttons = pagination.getElementsByTagName('button');
    for (let button of buttons) {
        button.classList.remove('bg-blue-800');
        button.classList.add('bg-blue-400');
    }
    activeButton.classList.remove('bg-blue-400');
    activeButton.classList.add('bg-blue-800');
}


function renderTableData(data) {

    addButtonsForFilter();

    const tableForWeather = document.getElementById('tableForWeather');
    console.log(data);

    tableForWeather.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let a = 0;
    data.slice(start, end).map(element => {
        if (a == 0) {
            let header = `<tr class='bg-blue-100 text-blue-600 border-b border-blue-300 '> 
            <th class='p-2 text-center border-r border-blue-300 w-1/4 border-l' colspan="2">Date</th>  
            <th class='p-2 text-center border-r border-blue-300 w-1/4'>Time</th> 
            <th class='p-2 text-center border-r border-blue-300 w-1/4'>Temp</th>
            <th class='p-2 text-center border-r w-1/4'>Desc</th>
          </tr>`;
            tableForWeather.innerHTML = header;
            a++;
        }

        const [date, time] = element.dt_txt.split(' ');
        let value = `<tr class='text-gray-700 bg-white border-b border-blue-300 hover:bg-blue-50 text-sm'> 
                        <td class='p-2 text-center border-r border-blue-300 w-1/4 border-l' colspan="2">${date}</td>
                        <td class='p-2 text-center border-r border-blue-300 w-1/4'>${time}</td>
                        <td class='p-2 text-center border-r border-blue-300 w-1/4'>${element.main.temp}°C</td>
                        <td class='p-2 text-center w-1/4 border-r border-blue-300'>${element.weather[0].main}</td>
                     </tr>`;
        tableForWeather.innerHTML += value;
    });
}




