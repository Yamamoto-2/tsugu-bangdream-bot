import { Card } from "../types/Card";
import { Attribute } from "../types/Attribute";
import { Character } from "../types/Character";
import mainAPI from "../types/_Main"
import { match } from "../commands/fuzzySearch"
import { Canvas, createCanvas, Image, loadImage } from "canvas"

export async function drawCardList(matches: { [key: string]: string[] }) {
    //计算模糊搜索结果
    var tempCardList: Array<Card> = [];//最终输出的卡牌列表
    var cardIdList: Array<number> = Object.keys(mainAPI['cards']).map(Number);//所有卡牌ID列表
    for (let i = 0; i < cardIdList.length; i++) {
        const tempCard = new Card(cardIdList[i]);
        var isMatch = match(matches, tempCard,['scoreUpMaxValue']);
        if (isMatch) {
            tempCardList.push(tempCard);
        }
    }

    //计算表格，X轴为颜色，Y轴为角色
    var characterIdList:number[] = [];
    var attributeList:{[attribute:string]:{[characterId:string]:Array<Card>}} ={};
    for(let i = 0; i < tempCardList.length; i++) {
        const tempCard = tempCardList[i];
        if(!characterIdList.includes(tempCard.characterId)) {
            characterIdList.push(tempCard.characterId);
        }
        if(!attributeList[tempCard.attribute]) {
            attributeList[tempCard.attribute] = {};
            if(!attributeList[tempCard.attribute][tempCard.characterId]) {
                attributeList[tempCard.attribute][tempCard.characterId] = [];
            }

        }
        if(!attributeList[tempCard.attribute][tempCard.characterId].includes(tempCard)) {
            attributeList[tempCard.attribute][tempCard.characterId].push(tempCard);
        }
    }
    console.log(attributeList);
    
    for(var attribute in attributeList){

    }
}

async function drawCardListAttribute(attribute:Attribute,characterIdList:number[],attributeList:{[characterId:string]:Array<Card>}) {
    var canvas = createCanvas(1000, 1000);
    var ctx = canvas.getContext('2d');


    return canvas;
}