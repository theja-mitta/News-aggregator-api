const fs = require('fs');

const writeDataToPath = (data, writePath) => {
    fs.writeFileSync(writePath, JSON.stringify(data), { encoding: 'utf-8', flag: 'w' });
}

module.exports = {
    writeDataToPath
};