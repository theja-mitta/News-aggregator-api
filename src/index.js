const app = require('./app');
// const cronJob = require('./helpers/cacheUpdaterCronJob');

const port = process.env.PORT;

app.listen(port, (error) => {
    if (!error) {
        console.log('Server is up and running on port ' + port);
    } else {
        console.log('Error has occured', error);
    }
});


