console.log("Game of thrones graph generator")

const gotRequest = require("./gotRequest")
const fs = require("fs");
let nextId = 0;

;(async function(){

    console.log("Requesting Characters")
    let characters = await gotRequest.getAllCharacters()
    characters = characters.filter((el) => el.tvSeries.length > 0 && el.tvSeries[0] != "")

    console.log("Requesting Houses")
    let houses = await gotRequest.getAllHouses()

    console.log("Graph creation")
    characters = characters.map((character) => {
        let node = {
            urls: {
                character: character.url,
                father: character.father != "" ? character.father : undefined,
                mother: character.mother != "" ? character.mother : undefined,
                allegiances: character.allegiances,
            },
            label: character.name != "" ? character.name : character.aliases[0],
            id: nextId,
            type: "character",
            metadata: {
                gender: character.gender != "" ? character.gender : undefined,
                culture: character.culture != "" ? character.culture : undefined,
                born: character.born != "" ? character.born : undefined,
                died: character.died != "" ? character.died : undefined,
            }
        }
        nextId++;
        return node;
    });

    houses = houses.map((house) => {
        let node = {
            urls: {
                house: house.url,
                currentLord: house.currentLord != "" ? house.currentLord : undefined,
                heir: house.heir != "" ? house.heir : undefined,
                overlord: house.overlord != "" ? house.overlord : undefined,
            },
            label: house.name != "" ? house.name : undefined,
            id: nextId,
            type: "house",
            metadata: {
                region: house.region != "" ? house.region : undefined,
                coatOfArms: house.coatOfArms != "" ? house.coatOfArms : undefined,
                words: house.words != "" ? house.words : undefined,
                founded: house.founded != "" ? house.founded : undefined,
                diedOut: house.diedOut != "" ? house.diedOut : undefined
            }
        }
        nextId++;
        return node;
    });

    let links = [];

    characters.forEach((el) => {
        if(el.urls.father){
            let other = characters.find((otherEl) => otherEl.urls.character == el.urls.father);
            if(other) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "father"
                })
            }
        }
        if(el.urls.mother){
            let other = characters.find((otherEl) => otherEl.urls.character == el.urls.mother);
            if(other) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "mother"
                })
            }
        }
        for(let alleigence of el.urls.allegiances){
            let other = houses.find((otherEl) => otherEl.urls.house == alleigence);
            if(other && other.urls.heir == el.urls.character) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "heir"
                })
            } else if(other && other.urls.currentLord == el.urls.character) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "lord"
                })
            } else if(other) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "alleigence"
                })
            }
        }
    })

    characters.forEach((el) => {
        if(el.urls.overlord){
            let other = houses.find((otherEl) => otherEl.urls.house == el.urls.overlord);
            if(other) {
                links.push({
                    target: other.id,
                    source: el.id,
                    type: "overlord"
                })
            }
        }
    })

    characters.push({
        id: nextId,
        label: "Adrein Kriegler",
        type: "character",
        metadata: {
            gender: "Male"
        }
    })
    links.push({
        source: nextId,
        target: houses.find((el) => el.label == "House Lannister of Casterly Rock").id,
        type: "alleigence"
    })
    nextId++;

    characters.push({
        id: nextId,
        label: "Tonio",
        type: "character",
        metadata: {
            gender: "Male"
        }
    })
    links.push({
        source: nextId,
        target: houses.find((el) => el.label == "House Nymeros Martell of Sunspear").id,
        type: "alleigence"
    })
    nextId++;

    characters.push({
        id: nextId,
        label: "Romain Junca",
        type: "character",
        metadata: {
            gender: "Male",
            comment: "Un cousin éloigné encore vivant mais qui d'en bat la raie de ces histoires de trône"
        }
    })
    links.push({
        source: nextId,
        target: houses.find((el) => el.label == "House Stark of Winterfell").id,
        type: "alleigence"
    })
    nextId++;

    characters.push({
        id: nextId,
        label: "Alexis Billequin",
        type: "character",
        metadata: {
            gender: "Male"
        }
    })
    links.push({
        source: nextId,
        target: houses.find((el) => el.label == "House Tyrell of Highgarden").id,
        type: "alleigence"
    })
    nextId++;

    let nodes = [...characters,...houses].map((el) => {
        el.urls = undefined;
        return el;
    }).filter((el) => links.find((ln) => el.id == ln.source || el.id == ln.target));

    let result = {nodes,links}

    fs.writeFileSync("graph.json",JSON.stringify(result))

    console.log("Creating presets")

    let starks = {
        name: "Stark family",
        description: "House Stark of Winterfell is a Great House of Westeros, ruling over the vast region known as the North from their seat in Winterfell.",
        mainNode: nodes.find((el) => el.label == "House Stark of Winterfell").id,
        nodes: nodes.filter((el) => el.label.includes("Stark")).map((el) => el.id)
    }

    let targaryens = {
        name: "Targaryens",
        description: "House Targaryen of Dragonstone is a Great House of Westeros and was the ruling royal House of the Seven Kingdoms for three centuries since it conquered and unified the realm, before it was deposed during Robert's Rebellion and House Baratheon replaced it as the new royal House.",
        mainNode: nodes.find((el) => el.label == "House Targaryen of King's Landing").id,
        nodes: nodes.filter((el) => el.label.includes("Targaryen")).map((el) => el.id)
    }

    let lannisters = {
        name: "Lannisters",
        description: "House Lannister of Casterly Rock is one of the Great Houses of Westeros, one of its richest and most powerful families and oldest dynasties.",
        mainNode: nodes.find((el) => el.label == "House Lannister of Casterly Rock").id,
        nodes: nodes.filter((el) => el.label.includes("Lannister")).map((el) => el.id)
    }

    let snow = {
        name: "Jon Snow",
        description: "Jon Snow, born Aegon Targaryen, is the son of Lyanna Stark and Rhaegar Targaryen, the late Prince of Dragonstone.",
        mainNode: nodes.find((el) => el.label == "Jon Snow").id
    }

    let eddard = {
        name: "Eddard Stark",
        description: "Lord Eddard Stark, also known as Ned Stark, was the head of House Stark, the Lord of Winterfell, Lord Paramount and Warden of the North, and later Hand of the King to King Robert I Baratheon.",
        mainNode: nodes.find((el) => el.label == "Eddard Stark").id
    }

    let daeneris = {
        name: "Daenerys Targaryen",
        description: "Queen Daenerys Targaryen, also known as Dany and Daenerys Stormborn, is the younger sister of Rhaegar Targaryen and Viserys Targaryen.",
        mainNode: nodes.find((el) => el.label == "Daenerys Targaryen").id
    }


    fs.writeFileSync("presets.json",JSON.stringify([starks,targaryens,lannisters,daeneris,eddard,snow]))
    console.log("Finished")

})();