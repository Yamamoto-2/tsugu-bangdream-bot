//创建一个js的card类，用CardID创建

export class Card {
    cardID: Number;
    constructor(cardID: Number) {
        this.cardID = cardID;
    }
    getCardID() {
        return this.cardID;
    }
}