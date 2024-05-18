const Canvas = require('skia-canvas')
const config = require("@/config")
const utils = require('@/image/utils')
const loadImageFromPath = utils.loadImageFromPath


/**
 * @typedef {object} BestdoriNote
 * @property {"BPM" | "Long" | "Slide" | "Single" | "Directional"} type
 * @property {number} beat
 * @property {number} lane
 * @property {object} [connections]
 * @property {number} connections.beat
 * @property {number} connections.lane
 * @property {number} connections.time
 * @property {number} time
 *
 */

/**
 *
 * @param {object} payload
 * @param {number} payload.id
 * @param {string} payload.title
 * @param {string} payload.artist
 * @param {string} payload.author
 * @param {string} payload.diff
 * @param {number} payload.level
 * @param {string | Buffer} payload.cover
 * @param {Array<BestdoriNote>} chart
 * @returns Promise<Buffer>
 */
async function DrawPreview ({id, title, artist, author, diff, level, cover}, chart) {
    // 根据BPM和beat计算出真实时间
    /*
    const timepoints = chart.filter(n => n.type === "BPM")
    timepoints.sort((a, b) => a.beat - b.beat)
    timepoints.forEach((n, i, a) => {
        if (i === 0) a[i].time = 0
        else a[i].time = a[i - 1].time + 60 / a[i - 1].bpm * (a[i].beat - a[i - 1].beat)
        console.log(a[i].beat, a[i].bpm, a[i].time)
    })

     */
    const timepoints = chart.filter(n => n.type === 'BPM')
    timepoints.sort((a, b) => a.beat - b.beat)
    timepoints.forEach((tp, i, a) => {
        if (i === 0) a[i].time = 0
        else a[i].time = a[i - 1].time + (tp.beat - a[i - 1].beat) * (60 / a[i - 1].bpm)
    })
    const getTimepointBase = beat => {
        let lastBPM = timepoints[0]
        for (let i = 0; i < timepoints.length; i++) {
            if (timepoints[i].beat > beat) break
            lastBPM = timepoints[i]
        }
        return lastBPM
    }

    chart.forEach((n, i, a) => {
        if (n.type === "Long" || n.type === "Slide") {
            n.connections.forEach((c, j, cs) => {
                const tp = getTimepointBase(c.beat)
                cs[j].time = tp.time + 60 / tp.bpm * (c.beat - tp.beat)
            })
        } else if (n.type !== "BPM") {
            const tp = getTimepointBase(n.beat)
            a[i].time = tp.time + 60 / tp.bpm * (a[i].beat - tp.beat)
        }
    })

    const notes = []
    const generateSim = function (beat, time, lane) {
        notes.forEach(v => {
            if (v.beat === beat && v.lane === lane) return
            if (["Single", "Flick", "Skill", "Long", "Directional"].includes(v.type) && v.beat === beat)
                notes.push({ type: "Sim", time, lane: [v.lane, lane].sort((a, b) => a - b) })
        })
    }
    chart.forEach(n => {
        if (n.type === "Slide" || n.type === "Long") {
            const barTime = []
            const lane = []
            for (let i = 0; i < n.connections.length; i++) {
                const tick = n.connections[i]
                const time = tick.time
                if (i === 0) {
                    notes.push({ ...tick, type: tick.skill ? "Skill" : "Long", time })
                    barTime.push(time)
                    lane.push(tick.lane)
                    generateSim(tick.beat, time, tick.lane)
                } else if (i === n.connections.length - 1) {
                    barTime.push(time)
                    lane.push(tick.lane)
                    notes.push({ type: "Bar", time: [barTime[0], barTime[1]], lane: [lane[0], lane[1]]})
                    notes.push({ ...tick, type: tick.flick ? "Flick" : tick.skill ? "Skill" : "Long", time })
                    generateSim(tick.beat, time, tick.lane)
                } else {
                    barTime.push(time)
                    lane.push(tick.lane)
                    notes.push({ type: "Bar", time: [barTime[0], barTime[1]], lane: [lane[0], lane[1]] })
                    lane.shift()
                    barTime.shift()
                    if (!tick.hidden) notes.push({ ...tick, type: "Tick", time })
                }
            }
        } else if (n.type === "BPM") {
            notes.push(n)
        } else {
            const time = n.time
            const newNote = {
                ...n
            }
            if (n.type === "Single") {
                if (n.flick) newNote.type = "Flick"
                else if (n.skill) newNote.type = "Skill"
                else if (n.beat % 0.5 !== 0) newNote.type = "SingleOff"
                else newNote.type = "Single"
                notes.push(newNote)
                generateSim(n.beat, time, n.lane)
            } else if (n.type === "Directional") {
                notes.push(newNote)
                generateSim(n.beat, time, n.lane)
            } else newNote.type = n.type
        }
    })
    notes.sort((a, b) => {
        const typeSort = (type) => {
            return {"Bar": -2, "Sim": -1}[type] || 0
        }
        const typeSortResult = typeSort(a.type) - typeSort(b.type)
        if (typeSortResult !== 0) return typeSortResult
        if (a.time !== b.time) return a.time - b.time
        return a.lane - b.lane
    })

    const offset = 8;
    const infoAreaWidth = 240;
    const laneWidth = 32; // 轨道宽度需要包括分割线宽度；分割线平均占用其左右两侧轨道的空间。
    const splitLineWidth = 2;
    const blockDistance = 72; // 块与块之前的空隙；注意，这个数值是每块左右各占用的宽度。
    const heightPerSecond = 216; // 每秒对应的高度。
    const displayNotes = notes.filter(n => ['Single', 'SingleOff', 'Skill', 'Flick', 'Directional', 'Long'].includes(n.type))
    const chartLength = Math.ceil(displayNotes[displayNotes.length - 1].time + 0.25);

    const minHeight = 500; // 高度最小值，最小不能小于这个高度
    const originalWidth = blockDistance * 2 + laneWidth * 7;
    const originalHeight = heightPerSecond * chartLength; // 高度
    let width = infoAreaWidth + originalWidth;
    let height = originalHeight;
    let colCount = 1;

    while (width / height < 16 / 9) {
        if (width / height > 4 / 3) break;
        if (Math.ceil(originalHeight / (colCount + 1)) < minHeight) break;
        colCount++;
        const newWidth = infoAreaWidth + originalWidth * colCount;
        const newHeight = originalHeight / colCount;
        if (newHeight < minHeight) break;

        width = newWidth;
        height = newHeight;
    }

    const secondsPerCol = chartLength / colCount;

    const canvas = new Canvas.Canvas(width, height);
    const ctx = canvas.getContext('2d');

    // 读取音符图片
    const img_notes = {
        Single: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Single.png'),
        SingleOff: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/SingleOff.png'),
        Flick: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Flick.png'),
        FlickTop: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/FlickTop.png'),
        Skill: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Skill.png'),
        Long: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Long.png'),
        Tick: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Tick.png'),
        Sim: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/Sim.png'),
        LeftArrow: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/LeftArrow.png'),
        LeftArrowEnd: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/LeftArrowEnd.png'),
        RightArrow: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/RightArrow.png'),
        RightArrowEnd: await loadImageFromPath(config.assetsRootPath + '/SongChart/note/RightArrowEnd.png'),
    }
    // 读取封面
    const coverImg = await (async () => {
        try {
            if (typeof cover === "string" || Buffer.isBuffer(cover)) return await Canvas.loadImage(cover)
            else throw new Error()
        } catch (e) {
            return await loadImageFromPath(config.assetsRootPath + '/SongChart/jacket.png')
        }
    })()

    const adaptText = (fontSize, y) => {
        if (y <= fontSize / 2) ctx.textBaseline = 'top';
        else if (y >= height - fontSize / 2) ctx.textBaseline = 'bottom';
        else ctx.textBaseline = 'middle';
    }

    // 填充黑色背景
    ctx.save()
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, width, height);
    ctx.restore()
    
    // 画封面
    ctx.drawImage(coverImg, 8, 8, infoAreaWidth - 16, infoAreaWidth - 16)

    // 写谱面ID
    ctx.save();
    ctx.fillStyle = '#1f1e33'
    ctx.fillRect(offset - 8, offset - 8, 128, 24)
    ctx.fillStyle = '#FFF'
    ctx.font = '16px "Arial"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
        `${id}`,
        offset + 56,
        offset + 4,
        128);
    ctx.restore()

    // 写谱面难度
    const colorList = {
        easy: 'rgb(87, 192, 201)',
        normal: 'rgb(138, 201, 87)',
        hard: 'rgb(239, 161, 25)',
        expert: 'rgb(199, 96, 96)',
        special: 'rgb(195, 96, 199)'
    }
    
    ctx.save();
    ctx.fillStyle = colorList[diff];
    const coverWidth = infoAreaWidth - 16;
    ctx.fillRect(8 + coverWidth - 116, 8 + coverWidth - 12, 128, 24);
    ctx.fillStyle = '#FFF';
    ctx.font = '16px "Arial"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        `${diff} ${level}`,
        8 + coverWidth - 52,
        8 + coverWidth,
        128)
    ctx.restore();
    /*
    // 写标题、艺术家、作者和版权信息
    ctx.save();
    let endPos;
    ctx.fillStyle = '#FFF';
    ctx.font = '18px "Microsoft Yahei UI"';
    endPos = Canvas.fillTextInArea(ctx, title, 8, infoAreaWidth, infoAreaWidth - 16, height - infoAreaWidth, 22);
    ctx.font = '16px "Microsoft Yahei UI"';
    endPos = Canvas.fillTextInArea(ctx, artist, 8, endPos.y + 8, infoAreaWidth - 16, height - infoAreaWidth, 20);
    if (author) {
        ctx.font = '14px "Microsoft Yahei UI"';
        endPos = Canvas.fillTextInArea(ctx, author, 8, endPos.y + 8, infoAreaWidth - 16, height - infoAreaWidth, 18);
    }
    
    const copyrightText =
        `本图片由Hikawa Sayo Bot生成，由 @ReiKohaku 编写。\r` +
        `本功能（Bestdori 谱面预览图生成）所使用的资源均来自 Bestdori（https://bestdori.com/），\r` +
        `由此产生的责任与纠纷，同开发者无关；开发者不保证服务的稳定性和准确性。\r` +
        `本功能仅供学习交流使用，禁止以此进行商业应用，或用于非法用途。`;
    ctx.font = '12px "Microsoft Yahei UI"';
    ctx.fillStyle = '#999';
    Canvas.fillTextInArea(
        ctx,
        copyrightText,
        8,
        endPos.y + 36,
        infoAreaWidth - 16,
        height - 8,
        16);
    ctx.restore();
    */
    // 画轨道
    for (let i = 0; i < colCount; i++) {
        ctx.save()
        const x = infoAreaWidth + i * originalWidth + blockDistance;
        const w = laneWidth * 7;
        const grd = ctx.createLinearGradient(x, 0, x + splitLineWidth * 2, 0);
        grd.addColorStop(0, '#2F4E6F');
        grd.addColorStop(0.5, '#3E6F8A');
        grd.addColorStop(1, '#4D80A4');
        ctx.fillStyle = grd;
        ctx.fillRect(x - splitLineWidth * 2, 0, splitLineWidth * 2, height);
        ctx.fillRect(x + w, 0, splitLineWidth * 2, height);
        for (let j = 1; j <= 6; j++) {
            const splitLineX = x + laneWidth * j - splitLineWidth / 2;
            ctx.fillRect(splitLineX, 0, splitLineWidth, height);
        }
        ctx.restore()
    }

    // 画节拍线
    ctx.save()
    const bpmList = notes.filter(item => item.type === 'BPM')
    bpmList.sort((a, b) => a.time - b.time)
    bpmList.forEach((BPM, index, array) => {
        let beat = 0;
        const previousTime = array[index - 1] ? array[index - 1]['time'] : 0;
        const nextTime = array[index + 1] ? array[index + 1]['time'] : chartLength;
        do {
            ctx.save()
            ctx.strokeStyle = (beat % 1 === 0) ? 'rgba(17, 72, 74, 0.75)' : 'rgba(17, 72, 74, 0.4)';
            if (beat % 1 !== 0) ctx.setLineDash([5, 5]);
            const currentTime = BPM.time + beat * (60 / BPM.bpm);
            const drawCol = Math.floor(currentTime / secondsPerCol);
            const x = infoAreaWidth + drawCol * originalWidth + blockDistance;
            const w = 7 * laneWidth;
            const y = height - (currentTime * heightPerSecond) % height;
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + w, y)
            ctx.stroke();
            beat += 0.5;
            ctx.restore()
        } while (BPM.time + beat * (60 / BPM.bpm) < nextTime && BPM.time + beat * (60 / BPM.bpm) >= previousTime)
    })
    ctx.restore()

    // 画时间轴
    ctx.save()
    ctx.font = '18px "Arial"';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'right';
    for (let i = 0; i <= chartLength; i += 5) {
        const drawCol = Math.floor(i / secondsPerCol);
        const x = infoAreaWidth + drawCol * originalWidth + blockDistance;
        const w = 7 * laneWidth;
        const y = height - (i * heightPerSecond) % height;
        adaptText(18, y);
        ctx.fillText(
            `${Math.floor(i / 60)}:${(i % 60)}`,
            x - 8,
            y);
    }
    ctx.restore()

    // 画音符位置线和BPM线 // 如果不提前画，会覆盖住某些双押的音符
    for (let i = 0, n = 0; i < notes.length; i++) {
        const noteType = ['Single', 'SingleOff', 'Flick', 'Long', 'Skill', 'Tick', 'Directional'];
        const note = notes[i];

        const drawCol = Math.floor(note.time / secondsPerCol);
        const x = infoAreaWidth + drawCol * originalWidth + blockDistance;
        const w = 7 * laneWidth;
        const y = height - (note.time * heightPerSecond) % height;

        if (noteType.includes(note.type)) {
            n++;
            if (n % 50 === 0) {
                ctx.font = '18px "Arial"';
                ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
                ctx.textAlign = 'left';

                ctx.fillRect(x, y - 1, w, 2);

                ctx.fillStyle = '#FFF';
                adaptText(18, y);
                ctx.fillText(`${n}`, x + w + 8, y);
            }
        } else if (note.type === 'BPM') {
            // TODO: 把这玩意儿移出去单独画！！！还有小节线呢（瘫
            ctx.fillStyle = '#C34FBB';
            ctx.fillRect(x, y - 1, w, 2);

            ctx.font = '18px "Arial"';
            ctx.textAlign = 'left';
            adaptText(18, y);
            ctx.fillText(`${note['bpm']}`, x + w + 8, y);
        }
    }

    notes.forEach((note, index, array) => {
        switch(note.type) {
            case 'Single':
            case 'SingleOff':
            case 'Skill':
            case 'Flick':
            case 'Long':
            case 'Tick':
                const drawCol = Math.floor(note.time / secondsPerCol);
                const img = img_notes[note.type];
                const w = laneWidth;
                const h = laneWidth * img.height / img.width;
                const x = infoAreaWidth + drawCol * originalWidth + blockDistance + note.lane * laneWidth;
                const y = height - (note.time * heightPerSecond) % height - h / 2;
                ctx.drawImage(img, x, y, w, h);
                if (note.type === 'Flick') {
                    ctx.drawImage(
                        img_notes.FlickTop,
                        x + laneWidth * 0.2,
                        y - h,
                        laneWidth * 0.6,
                        (laneWidth * 0.6) * img_notes.FlickTop.height / img_notes.FlickTop.width);
                }
                // if (x > 5836 && y < 20) console.log(note.time, secondsPerCol, h, note);
                break;
            case "Directional":
                const arrowCol = Math.floor(note.time / secondsPerCol);
                const arrowImg = img_notes[note.direction === "Left" ? "LeftArrow" : "RightArrow"]
                const direction = note.direction === "Left" ? -1 : 1
                for (let i = 0; i < note.width; i++) {
                    const w = laneWidth;
                    const h = laneWidth * arrowImg.height / arrowImg.width;
                    const x = infoAreaWidth + arrowCol * originalWidth + blockDistance + (note.lane + i * direction) * laneWidth;
                    const y = height - (note.time * heightPerSecond) % height - h / 2;
                    ctx.drawImage(arrowImg, x, y, w, h);
                    if (i + 1 === note.width) {
                        const endImg = img_notes[note.direction === "Left" ? "LeftArrowEnd" : "RightArrowEnd"]
                        const arrowEndX = (direction === 1) ? (x + laneWidth) : (x - laneWidth * 0.4)
                        ctx.drawImage(
                            endImg,
                            arrowEndX,
                            y,
                            laneWidth * 0.4,
                            (laneWidth * 0.4) * endImg.height / endImg.width);
                    }
                }
                break
            case 'Sim':
                const simCol = Math.floor(note.time / secondsPerCol);
                note.lane.sort((a, b) => a - b);
                const simW = laneWidth * (note.lane[1] - note.lane[0] - 1);
                const simH = 2;
                const simStartX = infoAreaWidth + simCol * originalWidth + blockDistance + (note.lane[0] + 1) * laneWidth;
                const simY = height - (note.time * heightPerSecond) % height - simH / 2;
                ctx.drawImage(img_notes['Sim'], simStartX, simY, simW, simH);
                break;
            case 'Bar':
                const startCol = Math.floor(note.time[0] / secondsPerCol);
                const endCol = Math.floor(note.time[1] / secondsPerCol);
                for (let i = startCol; i <= endCol; i++) {
                    let x1 = infoAreaWidth + i * originalWidth + blockDistance + note.lane[0] * laneWidth;
                    let x2 = infoAreaWidth + i * originalWidth + blockDistance + note.lane[1] * laneWidth;
                    let y1 = height * (i + 1) - note.time[0] * heightPerSecond;
                    let y2 = height * (i + 1) - note.time[1] * heightPerSecond;
                    const w = laneWidth * 0.8;

                    // if (startCol !== endCol)
                    //     console.log(`Bar from ${startCol}(${note.time[0]}) to ${endCol}, now ${i}, A (${x1},${y1}), B(${x2},${y2})`);

                    ctx.beginPath();
                    ctx.moveTo(x1 + (laneWidth - w) / 2, y1);
                    ctx.lineTo(x1 + (laneWidth - w) / 2 + w, y1);
                    ctx.lineTo(x2 + (laneWidth - w) / 2 + w, y2);
                    ctx.lineTo(x2 + (laneWidth - w) / 2, y2);
                    ctx.closePath();
                    const grd = ctx.createLinearGradient(x1, y1, x2, y2);
                    grd.addColorStop(0, 'rgba(16, 143, 19, 0.5)');
                    grd.addColorStop(0.5, 'rgba(33, 177, 39, 0.5)');
                    grd.addColorStop(1, 'rgba(16, 143, 19, 0.5)');
                    ctx.fillStyle = grd;
                    ctx.fill();
                }
                break;
            default:
            //
        }
    })
    return canvas
}
module.exports.DrawPreview = DrawPreview
