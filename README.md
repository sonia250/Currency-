 Currency Exchange Tracker

A web application that allows users to track and convert currencies, view exchange rates, save favorite currency pairs, and check historical exchange rate data.

 Features

- **Currency Conversion**: Convert between different currencies with real-time exchange rates
- **Favorite Currency Pairs**: Save and manage your frequently used currency pairs
- **Historical Data**: View exchange rate trends over different time periods
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Demo

[Link to Demo Video -https://www.loom.com/share/fa25848ae0ae4a99aaddad8cf9b64faf]

## API Used

This application uses the [ExchangeRate-API](https://v6.exchangerate-api.com/v6/) to fetch real-time currency exchange rates. The API provides:

- Current exchange rates
- Supported currencies
- Currency conversion

## Getting Started

### Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- API key from ExchangeRate-API

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/sonia250/currency-.git
cd currency-
   ```

2. Create a `config.js` file in the root directory with the API key:
   ```javascript
   const config = {
       apiKey: 'API_KEY_HERE'
   };
   ```

3. Open `index.html` in the web browser to run the application locally.

## Deployment

I deployed the application to the provided web servers and configured the load balancer following these steps:

### Server Deployment (Web01 and Web02)

1. Connected to each web server via SSH:
   ```
   ssh username@web01_ip_address
   ssh username@web02_ip_address
   ```

2. Created a directory for the application in the web root:
   ```
   sudo mkdir -p /var/www/html/currency-tracker
   ```

3. Set appropriate permissions:
   ```
   sudo chown -R $USER:$USER /var/www/html/currency-tracker
   ```

4. Copied the application files to both servers:
   ```
   scp -r * username@web01_ip_address:/var/www/html/currency-tracker/
   scp -r * username@web02_ip_address:/var/www/html/currency-tracker/
   ```

5. Configured Apache/Nginx on each server to serve the application.

### Load Balancer Configuration (Lb01)

1. Connected to the load balancer via SSH:
   ```
   ssh username@lb01_ip_address
   ```

2. Installed and configured HAProxy (if not already installed):
   ```
   sudo apt update
   sudo apt install haproxy
   ```

3. Configured HAProxy by editing the configuration file:
   ```
   sudo nano /etc/haproxy/haproxy.cfg
   ```

4. Added the following configuration:
   ```
   frontend http_front
       bind *:80
       stats uri /haproxy?stats
       default_backend http_back

   backend http_back
       balance roundrobin
       server web01 web01_ip_address:80 check
       server web02 web02_ip_address:80 check
   ```

5. Restarted HAProxy:
   ```
   sudo systemctl restart haproxy
   ```

6. Verified the load balancer was working correctly by accessing the application through the load balancer's IP address.

## Testing

To verify the load balancer was correctly distributing traffic between the two web servers, I performed the following tests:

1. Added log statements in the application to track which server was handling the request.
2. Made multiple requests to the load balancer and observed the logs on both web servers.
3. Temporarily disabled one server to ensure traffic was redirected to the remaining active server.

## Error Handling

The application includes robust error handling:

- Graceful handling of API failures
- User-friendly error messages
- Fallback options when certain features are unavailable
- Validation of user inputs

## Challenges and Solutions

During development, I encountered the following challenges:

1. **API Rate Limits**: The free tier of ExchangeRate-API has limited requests per month.
   - Solution: Implemented caching to reduce the number of API calls.

2. **Historical Data Limitations**: The free tier doesn't provide historical data.
   - Solution: Simulated historical data using random variations around the current rate for demonstration purposes.

3. **Load Balancer Session Persistence**: Favorites stored in localStorage weren't persisting across different servers.
   - Solution: Implemented sticky sessions in the load balancer configuration to ensure users are directed to the same server consistently.

## Future Improvements

- Add user accounts to save preferences across devices
- Implement more advanced charting options
- Add email alerts for significant rate changes
- Support for cryptocurrency conversions

## Credits

- Exchange rate data provided by [ExchangeRate-API](https://www.exchangerate-api.com/)
- Charts created using [Chart.js](https://www.chartjs.org/)
- Icons from [Font Awesome](https://fontawesome.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
