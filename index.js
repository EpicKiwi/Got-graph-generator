console.log("Game of thrones graph generator")

const gotRequest = require("./gotRequest")

;(async function(){

    console.log("Requesting Characters")
    let characters = await gotRequest.getAllCharacters()
    characters = characters.filter((el) => el.tvSeries.length > 0 && el.tvSeries[0] != "")

    console.log("Requesting Houses")
    let houses = await gotRequest.getAllHouses()

    console.log(characters)
    console.log(houses)

})();