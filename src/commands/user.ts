import { Session, h } from "koishi";
import { Server, getServerByName } from "../types/Server";
import { Player } from "../types/Player";
import { tsuguUser, bindingPlayerPromptWaitingTime, serverNameFullList, BindingStatus, Config } from "../config";
import { commandSearchPlayer } from "./searchPlayer";
import { generateVerifyCode } from './utils';
import { paresMessageList } from '../utils';
import { getRemoteDBUserData, changeUserData, bindPlayerRequest, bindPlayerVerify } from '../api/remoteDB';

export async function getUser(session: Session<'tsugu', never>, config: Config): Promise<tsuguUser> {
    let user: tsuguUser
    // 如果开启了远程数据库，则从远程数据库获取用户数据
    if (config.RemoteDBSwitch) {
    const tempData = await getRemoteDBUserData(config.RemoteDBHost, session.platform, session.userId)
    if (tempData?.status != 'success') {
        throw new Error(tempData?.data as string)
        }
        user = tempData.data as tsuguUser
    }
    else {
        user = session.user.tsugu
    }
    return user
}

// 绑定玩家
export async function commandBindPlayer(config: Config, session: Session<'tsugu', never>, serverName?: string) {
    const backendUrl = config.backendUrl
    let user: tsuguUser
    try {
        user = await getUser(session, config)
    } catch (error) {
        return error.message
    }
    console.log(user)
    let server: Server
    // 获得待绑定的服务器
    if (!serverName) {
        server = user.server_mode
    }
    else {
        server = getServerByName(serverName)
        if (server == undefined) {
            return '错误: 服务器不存在，请不要在参数中添加玩家ID'
        }
    }
    const curServer = user.server_list[server]

    // 生成验证码
    let tempID: number
    // 如果使用远程服务器，则从远程服务器获取验证码
    if (config.RemoteDBSwitch) {
        const tempData = await bindPlayerRequest(config.RemoteDBHost, session.platform, session.userId, server, true)
        if (tempData.status != 'success') {
            return (tempData.data as string)
        }
        tempID = (tempData.data as { verifyCode: number }).verifyCode
    }
    else {
        // 生成从10000到99999的随机数，且不包含64和89
        tempID = generateVerifyCode()
    }

    await session.send(`正在绑定 ${serverNameFullList[server]} 账号，请将你的\n评论(个性签名)\n或者\n你的当前使用的卡组的卡组名(乐队编队名称)\n改为以下数字后，直接发送你的玩家id\n${tempID}`)

    // 等待下一步录入
    const input = await session.prompt(bindingPlayerPromptWaitingTime)

    // 处理input，检测是否为数字
    let playerId: number
    if (!input) {
        // prompt超时
        curServer.bindingStatus = BindingStatus.None
        return '错误: 等待超时'
    }

    playerId = parseInt(input)

    if (Number.isNaN(playerId)) {
        return '错误: 无效的玩家id'
    }

    // 验证玩家信息，如果使用远程服务器，则从远程服务器获取验证码
    if (config.RemoteDBSwitch) {
        const tempData = await bindPlayerVerify(config.RemoteDBHost, session.platform, session.userId, server, playerId, true)
        if (tempData.status != 'success') {
            return (tempData.data as string)
        }
        else {
            // 修改玩家绑定信息
            // 清除验证码，将绑定状态设为 Success
            session.send(`绑定 ${serverNameFullList[server]} 玩家 ${playerId} 成功, 正在生成玩家状态图片`)
            user.platform = session.platform
            user.user_id = session.userId
            curServer.bindingStatus = BindingStatus.Success
            const result = paresMessageList(await commandSearchPlayer(backendUrl, user, playerId, serverName, config.useEasyBG, config.compress))
            return result
        }
    }
    else {
        const player = new Player(playerId, server)
        curServer.playerId = playerId
        await session.send(`正在验证玩家信息${playerId}，请稍后...`)
        await player.initFull()
        if (player.initError) {
            curServer.bindingStatus = BindingStatus.None
            // 此处不重置验证码和玩家id，以备重试时直接使用
            return '错误: 请求api超时，请稍后重试'
        }
        else if (!player.isExist) {
            curServer.bindingStatus = BindingStatus.None
            curServer.playerId = 0
            return `错误: 不存在玩家${playerId}`
        }
        else if (player.profile.mainUserDeck.deckName == tempID.toString() || player.profile.introduction == tempID.toString()) {
            // 修改玩家绑定信息
            // 清除验证码，将绑定状态设为 Success
            session.send(`绑定${serverNameFullList[server]}玩家${playerId}成功, 正在生成玩家状态图片`)
            user.platform = session.platform
            user.user_id = session.userId
            curServer.bindingStatus = BindingStatus.Success
            const result = paresMessageList(await commandSearchPlayer(backendUrl, user, playerId, serverName, config.useEasyBG))
            return result
        }
        else {
            curServer.playerId = 0
            curServer.bindingStatus = BindingStatus.None
            return `错误: \n评论为: "${player.profile.introduction}", \n卡组名为: "${player.profile.mainUserDeck.deckName}", \n都与验证码不匹配`
        }
    }

}

// 解绑玩家，如果使用远程服务器，需要验证
export async function commandUnbindPlayer(config: Config, session: Session<'tsugu', never>, serverName?: string) {
    //const backendUrl = config.backendUrl
    let user: tsuguUser
    try {
        user = await getUser(session, config)
    } catch (error) {
        return error.message
    }
    let server: Server
    // 获得待绑定的服务器
    if (!serverName) {
        server = user.server_mode
    }
    else {
        server = getServerByName(serverName)
        if (server == undefined) {
            return '错误: 服务器不存在，请不要在参数中添加玩家ID'
        }
    }
    const curServer = user.server_list[server]
    if (curServer.bindingStatus != BindingStatus.Success) {
        return `错误: 未检测到 ${serverNameFullList[server]} 的玩家数据`
    }

    // 如果使用远程服务器，则从远程服务器获取验证码并且验证
    if (config.RemoteDBSwitch) {
        // 发起解绑请求
        const playerId = curServer.playerId
        const tempData = await bindPlayerRequest(config.RemoteDBHost, session.platform, session.userId, server, false)
        if (tempData.status != 'success') {
            return (tempData.data as string)
        }
        const tempID = (tempData.data as { verifyCode: number }).verifyCode
        // 等待下一步验证
        await session.send(`正在解除绑定 ${serverNameFullList[server]} 账号 ${playerId} \n因为使用远程服务器，解除绑定需要验证\n请将 ${playerId} 账号的\n评论(个性签名)\n或者\n你的当前使用的卡组的卡组名(乐队编队名称)\n改为以下数字后，发送任意消息继续\n${tempID}`)
        await session.prompt(bindingPlayerPromptWaitingTime)
        const tempData2 = await bindPlayerVerify(config.RemoteDBHost, session.platform, session.userId, server, playerId, false)
        if (tempData2.status != 'success') {
            return (tempData2.data as string)
        }
        else {
            curServer.bindingStatus = BindingStatus.None
            curServer.playerId = 0
            return `成功解除绑定 ${serverNameFullList[server]} 账号 ${playerId}`
        }
    }
    else {
        const playerId = curServer.playerId
        curServer.bindingStatus = BindingStatus.None
        curServer.playerId = 0
        return `成功解除绑定 ${serverNameFullList[server]} 账号 ${playerId}`
    }
}

export async function commandPlayerInfo(config: Config, session: Session<'tsugu', never>, serverName: string, useEasyBG: boolean, compress: boolean) {
    let user: tsuguUser
    try {
        user = await getUser(session, config)
    } catch (error) {
        return error.message
    }
    let server: Server
    if (!serverName) {
        server = user.server_mode
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }
    const curServer = user.server_list[server]

    if (curServer.bindingStatus != BindingStatus.Success) {
        return `错误: 未检测到${serverNameFullList[server]}的玩家数据`
    }
    else {
        const result = await commandSearchPlayer(config.backendUrl, user, curServer.playerId, serverName, useEasyBG, compress)
        return h.image(result[0] as Buffer, 'image/png')
    }
}

export async function commandSwitchServerMode(config: Config, session: Session<'tsugu', never>, serverName: string) {
    let server: Server
    if (!serverName) {
        return '错误: 未指定服务器'
    }
    else {
        server = getServerByName(serverName)
    }
    if (server == undefined) {
        return '错误: 服务器不存在'
    }

    let user: tsuguUser
    try {
        user = await getUser(session, config)
    } catch (error) {
        return error.message
    }

    if (config.RemoteDBSwitch) {
        const tempData = await changeUserData(config.RemoteDBHost, session.platform, session.userId, { server_mode: server })
        if (tempData.status != 'success') {
            return (tempData.data as string)
        }
        else {
            user.server_mode = server
            return `已切换到${serverNameFullList[server]}模式`
        }
    }
    else {
        user.server_mode = server
        return `已切换到${serverNameFullList[server]}模式`
    }

}

export async function commandSwitchDefaultServer(config: Config, session: Session<'tsugu', never>, serverName: string[]) {

    const servers = serverName.map(s => getServerByName(s))
    if (new Set(servers).size != servers.length) {
        return '错误: 指定了重复的服务器'
    }
    if (servers.length == 0) {
        return '错误: 请指定至少一个服务器'
    }
    if (servers.includes(undefined)) {
        return '错误: 指定了不存在的服务器'
    }
    else {

        let user: tsuguUser
        try {
            user = await getUser(session, config)
        } catch (error) {
            return error.message
        }

        if (config.RemoteDBSwitch) {
            const tempData = await changeUserData(config.RemoteDBHost, session.platform, session.userId, { default_server: servers })
            if (tempData.status != 'success') {
                return (tempData.data as string)
            }
            else {
                user.default_server = servers
                return `成功切换默认服务器顺序: ${servers.map(s => serverNameFullList[s]).join(", ")}`
            }
        }
        else {
            user.default_server = servers
            return `成功切换默认服务器顺序: ${servers.map(s => serverNameFullList[s]).join(", ")}`
        }

    }
}

export async function commandSwitchCarMode(config: Config, session: Session<'tsugu', never>, mode: boolean) {
    if (mode == undefined) {
        return '错误: 未知的车辆模式'
    }

    let user: tsuguUser
    try {
        user = await getUser(session, config)
    } catch (error) {
        return error.message
    }

    if (config.RemoteDBSwitch) {
        const tempData = await changeUserData(config.RemoteDBHost, session.platform, session.userId, { car: mode })
        if (tempData.status != 'success') {
            return (tempData.data as string)
        }
        else {
            user.car = mode
            return `已${mode ? '开启' : '关闭'}车牌转发`
        }
    }
    else {
        user.car = mode
        return `已${mode ? '开启' : '关闭'}车牌转发`
    }
}