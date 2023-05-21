import { Costume } from "../../types/Costume";
import { Card } from "../../types/Card";
import { Canvas } from "canvas";
import {drawList } from '../list'

async function drawSdcharaInList(card:Card):Promise<Canvas> {
    const costumeId = card.costumeId
    const costume = new Costume(costumeId)
    await costume.initFull()
    var sdcharaImage = await costume.getSdchara()
    return drawList({
        key: '演出缩略图',
        content: [sdcharaImage],
        lineHeight: 600,
        textSize: 580
    })
}

export {drawSdcharaInList}