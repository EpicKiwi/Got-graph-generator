const rp = require("request-promise-native")

async function getAllCharacters(){

    let allCharacters = [];
    let data = ""
    let currentPage = 1;
    do {
        let url = `https://www.anapioficeandfire.com/api/characters?page=${currentPage}&pageSize=50`
        data = JSON.parse(await rp(url));
        allCharacters = allCharacters.concat(data);
        currentPage++;
    } while(data.length > 0)

    return allCharacters;
}

async function getAllHouses(){

    let allHouses = [];
    let data = ""
    let currentPage = 1;
    do {
        let url = `https://www.anapioficeandfire.com/api/houses?page=${currentPage}&pageSize=50`
        data = JSON.parse(await rp(url));
        allHouses = allHouses.concat(data);
        currentPage++;
    } while(data.length > 0)

    return allHouses;
}

module.exports = {
    getAllCharacters,
    getAllHouses
}