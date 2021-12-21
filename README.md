1. Create a BestBuy Account.
2. Add card information and shipping information.
3. Create a .env file inside the resellbot folder.
4. Add the texts in 5. to the .env file (Make sure to use your id and password). 
    Also double check if the website address is correct
5. BESTBUY_ID=damon6291@gmail.com
BESTBUY_PWD=password
EMAIL=damon6291@gmail.com
PASSWORD=password
WEBSITE=https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149
6. login to your google account and set less secure app access to ON (This allows the email feature). 
7. Open up the terminal and write node index.js

--

1. The program will open up the bestbuy website and log in with your credentials.
2. Program will try to add the product to cart (possibly) forever.
3. Program will reload the page every 1.5 seconds to check if the product is avaialble.
4. When the product is available, the program will check the product out immedietly.
5. if the product errors in anypoint, it should restart automatically (It only stops when it buys the product).
6. The program will send you an email when the product is bought.