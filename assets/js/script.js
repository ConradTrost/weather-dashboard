var key = "e0f02b29daab7ccdefd34e4a61cf40c7";
var currentWeather = $(".current-weather");
var forecast = $(".forecast-display");
var items = [];

// Create local storage li thing
if (localStorage.getItem("saved") == null) {
    recentSearches = [];
} else {
    recentSearches = JSON.parse(localStorage.getItem("saved"))
    for (n in recentSearches) {
        $("#recents").append(
            '<button type="button" class="list-group-item list-group-item-action">'+recentSearches[n]+'</button>'
    )}
}

function UVI(lat, lon) {
    fetch('http://api.openweathermap.org/data/2.5/uvi?APPID='+key+'&lat='+lat+'&lon='+lon)
    .then((UVresponse) => {
        return UVresponse.json();
    })
    .then((UVresponse) => {
        var uvIndex = UVresponse.value;
        currentWeather.append('<p id="uv"> UV Index: ' +uvIndex+ '</p>')
        $("#uv").removeClass();
        if (uvIndex < 3) {
            $("#uv").addClass("green");
        } else if (UVresponse < 7.0) {
            $("#uv").addClass("yellow");
        } else {
            $("#uv").addClass("red");
        }
        return uvIndex;
    })

}
// Forecast Report
function forecastFUN(response) {
    forecast.html("");
    for (var i = 4; i < response.list.length; i += 8 ) {
        var forecastTemp = response.list[i].main.temp;
        // Formatting date (Maybe update to unix)
        var forecastTime = response.list[i].dt_txt;
        var forecastDay = forecastTime.split(" ");
        var theDay = forecastDay[0];
        var formatting = theDay.split("-");
        var finalDay = formatting[1]+'/'+formatting[2]+'/'+formatting[0];
        var forecastIconCode = response.list[i].weather[0].icon;
        var forecastHumidity = response.list[i].main.humidity;

        forecast.append(
            '<div class="forecast-indiv col"><p>' + finalDay + '</p>'
            + '<img id="wicon" src="http://openweathermap.org/img/wn/' + forecastIconCode + '@2x.png" alt="Weather icon">'
            + '<p>' + forecastTemp + ' &degF</p>'
            + '<p>' + forecastHumidity + '%</p></div>'
        )
    } return;
}

// Current Weather Report
function updatePage(response) {
    currentWeather.html("");
    var nameOfCity = response.name;
    var humidity = response.main.humidity;
    var windSpeed = response.wind.speed;
    var temp = response.main.temp;
    var iconCode = response.weather[0].icon;
    var date = new Date (response.dt * 1000);
    var actualDate = date.toLocaleDateString();

    // UV Index

    // Local Storage 
    if (recentSearches.includes(nameOfCity)) {
    }
    else {
        recentSearches.push(nameOfCity);
        var saving = JSON.stringify(recentSearches)
        localStorage.setItem("saved", saving)
    }

    currentWeather.html(
        '<div id="icon"><p class="display-4">'+nameOfCity+'</p>'
        + '<img id="wicon" src="http://openweathermap.org/img/wn/' + iconCode + '@2x.png" alt="Weather icon"></div>'
        + '<p>' + actualDate + '</p>'
        + '<br></br>'
        + '<p> Temperature: ' +temp+ ' &degF</p>'
        + '<p> Humidity: ' +humidity+ '%</p>'
        + '<p> Wind Speed: ' +windSpeed+ ' MPH</p>'
        );
    return;
}


function searchCity(cityName) {
    event.preventDefault();

    fetch('http://api.openweathermap.org/data/2.5/weather?q='+cityName+'&units=imperial&APPID='+key)
    .then(function(response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
        } else { 
            return response.json();
        }
    })
    // Temp, humidity, wind speed, uv index, city name, country, current date, icon
    .then((response) => {
        updatePage(response);
        UVI(response.coord.lat, response.coord.lon);
    })

    // then for forecast
    fetch('http://api.openweathermap.org/data/2.5/forecast?q='+cityName+'&units=imperial&APPID='+key)
    .then(function(foreResponse) {
        if (foreResponse.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              foreResponse.status);
            return;
        } else { 
            return foreResponse.json();
        }
    })
    .then((foreResponse) => {
        forecastFUN(foreResponse);
    })
};

$("#cityBTN").click(function() {
    var cityName = document.getElementById("city-input").value;
    searchCity(cityName);
});

$(".list-group-item").click(function() {
    cityName = $(this).text();
    searchCity(cityName);
})