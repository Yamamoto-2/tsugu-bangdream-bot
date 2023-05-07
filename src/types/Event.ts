import { callAPIAndCacheResponse } from '../api/getApi';

class Attribute {
    attribute: string;
    percent: number;

    constructor(attribute: string, percent: number) {
        this.attribute = attribute;
        this.percent = percent;
    }
}

class Character {
    characterId: number;
    percent: number;

    constructor(characterId: number, percent: number) {
        this.characterId = characterId;
        this.percent = percent;
    }
}

export class Event {
    id: number;
    eventType: string;
    eventName: string[];
    bannerAssetBundleName: string;
    startAt: string[];
    endAt: string[];
    attributes: Attribute[];
    characters: Character[];
    rewardCards: number[];
    data: any;

    constructor(id: number) {
        this.id = id;
    }

    async init() {
        const eventData = await this.getData();
        if (eventData == null) {
            console.error(`Event data not found for id ${this.id}`);
            return;
        }

        const parsedData = JSON.parse(eventData.toString());

        this.eventType = parsedData[this.id.toString()].eventType;
        this.eventName = parsedData[this.id.toString()].eventName;
        this.bannerAssetBundleName = parsedData[this.id.toString()].bannerAssetBundleName;
        this.startAt = parsedData[this.id.toString()].startAt;
        this.endAt = parsedData[this.id.toString()].endAt;
        this.attributes = parsedData[this.id.toString()].attributes.map((attr: any) => new Attribute(attr.attribute, attr.percent));
        this.characters = parsedData[this.id.toString()].characters.map((char: any) => new Character(char.characterId, char.percent));
        this.rewardCards = parsedData[this.id.toString()].rewardCards;
    }

    async getData() {
        // Replace this URL with the actual API URL for events
        const apiUrl = 'https://bestdori.com/api/events/';
        const eventData = await callAPIAndCacheResponse(apiUrl + this.id + '.json');
        return eventData;
    }
}
