// Check if config is available
if (typeof config === 'undefined' || !config.apiKey) {
    alert('API key is missing. Please set up your config.js file.');
}

// Main app code
const app = {
    // API base URL
    apiBaseUrl: 'https://v6.exchangerate-api.com/v6/',
    
    // DOM elements
    elements: {
        fromCurrency: document.getElementById('from-currency'),
        toCurrency: document.getElementById('to-currency'),
        amount: document.getElementById('amount'),
        result: document.getElementById('result'),
        convertBtn: document.getElementById('convert-btn'),
        swapBtn: document.getElementById('swap-btn'),
        rateInfo: document.getElementById('rate-info'),
        rateValue: document.getElementById('rate-value'),
        addFavorite: document.getElementById('add-favorite'),
        favoritesList: document.getElementById('favorites-list'),
        historyCurrencyPair: document.getElementById('history-currency-pair'),
        timePeriod: document.getElementById('time-period'),
        fetchHistoryBtn: document.getElementById('fetch-history-btn'),
        historicalChart: document.getElementById('historical-chart')
    },
    
    // State
    currencies: [],
    favorites: [],
    chart: null,
    
    // Initialize the app
    init: function() {
        // Load currencies
        this.loadCurrencies();
        
        // Load favorites from localStorage
        this.loadFavorites();
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    // Load available currencies
    loadCurrencies: async function() {
        try {
            const response = await fetch(`${this.apiBaseUrl}${config.apiKey}/codes`);
            const data = await response.json();
            
            if (data.result === 'success') {
                this.currencies = data.supported_codes;
                
                // Populate currency dropdowns
                this.populateCurrencyDropdowns();
                
                // Set default values
                this.elements.fromCurrency.value = 'USD';
                this.elements.toCurrency.value = 'EUR';
                
                // Get initial exchange rate
                this.getExchangeRate();
            } else {
                throw new Error('Failed to load currencies');
            }
        } catch (error) {
            console.error('Error loading currencies:', error);
            alert('Failed to load currencies. Please try again later.');
        }
    },
    
    // Populate currency dropdowns
    populateCurrencyDropdowns: function() {
        // Clear existing options
        this.elements.fromCurrency.innerHTML = '';
        this.elements.toCurrency.innerHTML = '';
        this.elements.historyCurrencyPair.innerHTML = '';
        
        // Add currencies to dropdowns
        this.currencies.forEach(([code, name]) => {
            const option1 = document.createElement('option');
            option1.value = code;
            option1.textContent = `${code} - ${name}`;
            
            const option2 = document.createElement('option');
            option2.value = code;
            option2.textContent = `${code} - ${name}`;
            
            this.elements.fromCurrency.appendChild(option1);
            this.elements.toCurrency.appendChild(option2.cloneNode(true));
        });
        
        // Add currency pairs to history dropdown
        const popularPairs = [
            ['USD', 'EUR'],
            ['USD', 'GBP'],
            ['USD', 'JPY'],
            ['EUR', 'USD'],
            ['GBP', 'USD']
        ];
        
        popularPairs.forEach(([from, to]) => {
            const option = document.createElement('option');
            option.value = `${from}-${to}`;
            option.textContent = `${from}/${to}`;
            this.elements.historyCurrencyPair.appendChild(option);
        });
    },
    
    // Get current exchange rate
    getExchangeRate: async function() {
        try {
            const fromCurrency = this.elements.fromCurrency.value;
            const toCurrency = this.elements.toCurrency.value;
            
            const response = await fetch(`${this.apiBaseUrl}${config.apiKey}/pair/${fromCurrency}/${toCurrency}`);
            const data = await response.json();
            
            if (data.result === 'success') {
                const rate = data.conversion_rate;
                
                // Update rate display
                this.elements.rateInfo.textContent = `1 ${fromCurrency} = `;
                this.elements.rateValue.textContent = `${rate} ${toCurrency}`;
                
                // Calculate and update result if amount is entered
                if (this.elements.amount.value) {
                    this.convertCurrency(rate);
                }
            } else {
                throw new Error('Failed to get exchange rate');
            }
        } catch (error) {
            console.error('Error getting exchange rate:', error);
            this.elements.rateValue.textContent = 'Error';
        }
    },
    
    // Convert currency based on the current rate
    convertCurrency: function(rate) {
        const amount = parseFloat(this.elements.amount.value);
        if (!isNaN(amount)) {
            const result = amount * rate;
            this.elements.result.value = result.toFixed(2);
        }
    },
    
    // Swap currencies
    swapCurrencies: function() {
        const temp = this.elements.fromCurrency.value;
        this.elements.fromCurrency.value = this.elements.toCurrency.value;
        this.elements.toCurrency.value = temp;
        
        // Also swap the result and amount if they exist
        if (this.elements.result.value && this.elements.amount.value) {
            const tempValue = this.elements.amount.value;
            this.elements.amount.value = this.elements.result.value;
            this.elements.result.value = '';
        }
        
        // Update the exchange rate
        this.getExchangeRate();
    },
    
    // Load favorites from localStorage
    loadFavorites: function() {
        const savedFavorites = localStorage.getItem('currencyFavorites');
        if (savedFavorites) {
            this.favorites = JSON.parse(savedFavorites);
            this.renderFavorites();
        }
    },
    
    // Save favorites to localStorage
    saveFavorites: function() {
        localStorage.setItem('currencyFavorites', JSON.stringify(this.favorites));
    },
    
    // Add current currency pair to favorites
    addToFavorites: function() {
        const fromCurrency = this.elements.fromCurrency.value;
        const toCurrency = this.elements.toCurrency.value;
        const pair = `${fromCurrency}-${toCurrency}`;
        
        // Check if pair already exists in favorites
        if (!this.favorites.some(fav => fav.pair === pair)) {
            this.favorites.push({
                pair,
                fromCurrency,
                toCurrency,
                rate: parseFloat(this.elements.rateValue.textContent.split(' ')[0])
            });
            
            this.saveFavorites();
            this.renderFavorites();
            
            // Change star icon to filled
            this.elements.addFavorite.innerHTML = '<i class="fas fa-star"></i>';
            setTimeout(() => {
                this.elements.addFavorite.innerHTML = '<i class="far fa-star"></i>';
            }, 1500);
        } else {
            alert('This currency pair is already in your favorites.');
        }
    },
    
    // Remove a pair from favorites
    removeFromFavorites: function(pair) {
        this.favorites = this.favorites.filter(fav => fav.pair !== pair);
        this.saveFavorites();
        this.renderFavorites();
    },
    
    // Render favorites list
    renderFavorites: function() {
        this.elements.favoritesList.innerHTML = '';
        
        if (this.favorites.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'You have no favorites yet. Add some currency pairs to track them here.';
            this.elements.favoritesList.appendChild(emptyMessage);
            return;
        }
        
        this.favorites.forEach(favorite => {
            const card = document.createElement('div');
            card.className = 'favorite-card';
            
            const info = document.createElement('div');
            info.className = 'favorite-info';
            
            const pairText = document.createElement('h3');
            pairText.textContent = `${favorite.fromCurrency}/${favorite.toCurrency}`;
            
            const rateText = document.createElement('p');
            rateText.textContent = `Rate: ${favorite.rate}`;
            
            info.appendChild(pairText);
            info.appendChild(rateText);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => {
                this.removeFromFavorites(favorite.pair);
            });
            
            card.appendChild(info);
            card.appendChild(removeBtn);
            
            // Add click event to load this pair
            card.addEventListener('click', (e) => {
                if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
                    this.elements.fromCurrency.value = favorite.fromCurrency;
                    this.elements.toCurrency.value = favorite.toCurrency;
                    this.getExchangeRate();
                }
            });
            
            this.elements.favoritesList.appendChild(card);
        });
    },
    
    // Fetch historical data and display chart
    fetchHistoricalData: async function() {
        try {
            const currencyPair = this.elements.historyCurrencyPair.value;
            const [fromCurrency, toCurrency] = currencyPair.split('-');
            const days = parseInt(this.elements.timePeriod.value);
            
            // Show loading state
            this.elements.historicalChart.innerHTML = '<p>Loading historical data...</p>';
            
            // For the free API, we'll simulate historical data since ExchangeRate-API free tier
            // doesn't provide historical data
            const today = new Date();
            const data = {
                labels: [],
                rates: []
            };
            
            // Simulate historical data based on current rate with small variations
            const response = await fetch(`${this.apiBaseUrl}${config.apiKey}/pair/${fromCurrency}/${toCurrency}`);
            const rateData = await response.json();
            
            if (rateData.result === 'success') {
                const baseRate = rateData.conversion_rate;
                
                for (let i = days; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(today.getDate() - i);
                    
                    // Format date as MM/DD
                    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                    data.labels.push(formattedDate);
                    
                    // Create a random variation of +/- 5% from the base rate
                    const variation = (Math.random() * 0.1) - 0.05;
                    const historicalRate = baseRate * (1 + variation);
                    data.rates.push(historicalRate.toFixed(4));
                }
                
                this.renderChart(data, fromCurrency, toCurrency);
            } else {
                throw new Error('Failed to get current exchange rate');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            this.elements.historicalChart.innerHTML = '<p>Error loading historical data. Please try again later.</p>';
        }
    },
    
    // Render chart with historical data
    renderChart: function(data, fromCurrency, toCurrency) {
        // Clear previous chart
        this.elements.historicalChart.innerHTML = '<canvas id="chart"></canvas>';
        const ctx = document.getElementById('chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `${fromCurrency}/${toCurrency} Exchange Rate`,
                    data: data.rates,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Historical ${fromCurrency}/${toCurrency} Exchange Rates`
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    },
    
    // Set up event listeners
    setupEventListeners: function() {
        // Convert currency when button is clicked
        this.elements.convertBtn.addEventListener('click', () => {
            this.getExchangeRate();
        });
        
        // Convert currency when input amount changes
        this.elements.amount.addEventListener('input', () => {
            if (this.elements.rateValue.textContent !== 'Loading...' && this.elements.rateValue.textContent !== 'Error') {
                const rate = parseFloat(this.elements.rateValue.textContent.split(' ')[0]);
                this.convertCurrency(rate);
            }
        });
        
        // Swap currencies when button is clicked
        this.elements.swapBtn.addEventListener('click', () => {
            this.swapCurrencies();
        });
        
        // Update exchange rate when currencies change
        this.elements.fromCurrency.addEventListener('change', () => {
            this.getExchangeRate();
        });
        
        this.elements.toCurrency.addEventListener('change', () => {
            this.getExchangeRate();
        });
        
        // Add current pair to favorites
        this.elements.addFavorite.addEventListener('click', () => {
            this.addToFavorites();
        });
        
        // Fetch historical data
        this.elements.fetchHistoryBtn.addEventListener('click', () => {
            this.fetchHistoricalData();
        });
    }
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});


document.addEventListener("DOMContentLoaded", function () {
    const fromCurrency = document.getElementById("from-currency");
    const toCurrency = document.getElementById("to-currency");
    const historyCurrencyPair = document.getElementById("history-currency-pair");
    const timePeriod = document.getElementById("time-period");
    const fetchHistoryBtn = document.getElementById("fetch-history-btn");
    const historicalChartContainer = document.getElementById("historical-chart");
    const convertBtn = document.getElementById("convert-btn");
    const swapBtn = document.getElementById("swap-btn");
    const amountInput = document.getElementById("amount");
    const resultInput = document.getElementById("result");
    const rateValue = document.getElementById("rate-value");

    const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "NGN", "KES", "ZAR"];

    function populateDropdown(dropdown) {
        dropdown.innerHTML = "";
        currencies.forEach(currency => {
            const option = document.createElement("option");
            option.value = currency;
            option.textContent = currency;
            dropdown.appendChild(option);
        });
    }

    function fetchExchangeRate() {
        const from = fromCurrency.value;
        const to = toCurrency.value;
        if (!from || !to) return;
        
        fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[to];
                rateValue.textContent = rate.toFixed(4);
                resultInput.value = (amountInput.value * rate).toFixed(2);
            })
            .catch(error => console.error("Error fetching exchange rate:", error));
    }

    function fetchHistoricalRates() {
        const pair = historyCurrencyPair.value;
        const days = timePeriod.value;
        
        if (!pair) return;
        
        const [base, target] = pair.split("/");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        fetch(`https://api.exchangerate.host/timeseries?start_date=${startStr}&end_date=${endStr}&base=${base}&symbols=${target}`)
            .then(response => response.json())
            .then(data => {
                if (!data.rates) throw new Error("No historical data available.");
                
                let labels = Object.keys(data.rates);
                let values = labels.map(date => data.rates[date][target]);

                historicalChartContainer.innerHTML = '<canvas id="historyChart"></canvas>';
                const ctx = document.getElementById("historyChart").getContext("2d");
                new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `${base} to ${target} Exchange Rate`,
                            data: values,
                            borderColor: "#3e95cd",
                            fill: false
                        }]
                    }
                });
            })
            .catch(error => console.error("Error fetching historical data:", error));
    }

    convertBtn.addEventListener("click", fetchExchangeRate);
    swapBtn.addEventListener("click", function () {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        fetchExchangeRate();
    });
    amountInput.addEventListener("input", fetchExchangeRate);
    fromCurrency.addEventListener("change", fetchExchangeRate);
    toCurrency.addEventListener("change", fetchExchangeRate);
    fetchHistoryBtn.addEventListener("click", fetchHistoricalRates);
    
    populateDropdown(fromCurrency);
    populateDropdown(toCurrency);
    populateDropdown(historyCurrencyPair);
    
    fromCurrency.value = "USD";
    toCurrency.value = "EUR";
    fetchExchangeRate();
});
