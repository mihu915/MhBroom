/**
 * PluginName: MhBroom
 * Version: 1.0.0
 * Date: 2022年3月11日10:23:33
 * Coder: mihu
 *
 */

//LiteLoaderScript Dev Helper
/// <reference path="e:\PersonCode\lite-loader-library/Library/JS/Api.js" />

// 杀死已生成的所有苦力怕:kill @e[type=creeper]
// 杀死已生成的所有骷髅:kill @e[type=skeleton]
// 杀死已生成的所有僵尸:kill @e[type=zombie]
// 杀死已生成的所有蜘蛛:kill @e[type=spider]
// 杀死已生成的所有猪人僵尸:kill @e[type=minecraft:zombie_pigman]
// 杀死除玩家以外的生物：kill @e[type=!player]
const PLUGIN_NAME = 'MhBroom'

ll.registerPlugin(
  PLUGIN_NAME,
  '方块人的扫帚，一款无需繁琐配置的地图清理插件',
  [1, 0, 0]
)

logger.setConsole(false)
logger.setFile('./logs/MhBroom.log')

const SweepType = {
  item: 'item', // 掉落物
  skt: 'skt', // 骷髅
  zb: 'zb', // 僵尸
  spd: 'spd', // 蜘蛛
  cp: 'cp', // 苦力怕
  zp: 'zp',
  any: 'any', // 所有生物
  help: 'help' // 查看帮助
}

// 处理提示信息
const handleClearMessage = (messageType, time, typeName, postfix = '') => {
  const prefix = `[§g${PLUGIN_NAME}§r]`

  switch (messageType) {
    case 1:
      return `${prefix} §3将在${time}后开始清理${typeName}§3${postfix}`
    case 2:
      return `${prefix} 开始清理${typeName}...`
    case 3:
      return `${prefix} 清理成功。`
    case 4:
      return `${prefix} 清理失败：[${postfix}]`
    default:
      return
  }
}

// 处理执行结果信息
const handleResult = (result, originTypeName) => {
  if (result.success) {
    mc.broadcast(handleClearMessage(3))
    logger.info(`清理${originTypeName}成功`)
  } else {
    mc.broadcast(handleClearMessage(4, null, null, result.output))
    logger.error(`清理${originTypeName}失败， [${result.output}]`)
  }
}

// 处理清理逻辑
const handleClear = (sweepType, delay) => {
  let originTypeName
  let typeName
  let clearOrder
  let postfix
  switch (sweepType) {
    case SweepType.item:
      originTypeName = '掉落物'
      typeName = `§c${originTypeName}§r`
      clearOrder = 'kill @e[type=item]' // 清除所有掉落物
      postfix = ' ，请保存好物品。'
      break
    case SweepType.any:
      originTypeName = '所有生物'
      typeName = `§6${originTypeName}§r`
      clearOrder = 'kill @e[type=!player]' // 清除所有生物，除玩家外
      postfix = ''
      break
    case SweepType.skt:
      originTypeName = '骷髅'
      typeName = `§7${originTypeName}§r`
      clearOrder = 'kill @e[type=skeleton]' // 清除所有骷髅
      postfix = ''
      break
    case SweepType.zb:
      originTypeName = '僵尸'
      typeName = `§2${originTypeName}§r`
      clearOrder = 'kill @e[type=zombie]' // 僵尸
      postfix = ''
      break
    case SweepType.cp:
      originTypeName = '苦力怕'
      typeName = `§a${originTypeName}§r`
      clearOrder = 'kill @e[type=creeper]' // 苦力怕
      postfix = ''
      break
    case SweepType.spd:
      originTypeName = '蜘蛛'
      typeName = `§4${originTypeName}§r`
      clearOrder = 'kill @e[type=spider]' // 蜘蛛
      postfix = ''
      break
    case SweepType.zp:
      originTypeName = '猪人'
      typeName = `§e${originTypeName}§r`
      clearOrder = 'kill @e[type=minecraft:zombie_pigman]'
      postfix = ''
      break
    default:
      break
  }

  if (delay) {
    let delaySecond = delay * 60
    const timer = setInterval(() => {
      switch (delaySecond) {
        case 600:
          mc.broadcast(handleClearMessage(1, '10分钟', typeName, postfix))
          break
        case 300:
          mc.broadcast(handleClearMessage(1, '5分钟', typeName, postfix))
          break
        case 60:
          mc.broadcast(handleClearMessage(1, '1分钟', typeName, postfix))
          break
        case 30:
          mc.broadcast(
            handleClearMessage(1, `${delaySecond}秒`, typeName, postfix)
          )
          break
        default:
          break
      }

      if (delaySecond > 0 && delaySecond <= 10) {
        mc.broadcast(`${handleClearMessage(1, `${delaySecond}秒`, typeName)}`)
      } else if (delaySecond === 0) {
        clearInterval(timer)
        mc.broadcast(handleClearMessage(2, null, typeName))
        handleResult(mc.runcmdEx(clearOrder), originTypeName)
      }
      delaySecond--
    }, 1000)
  } else {
    mc.broadcast(handleClearMessage(2, null, typeName))
    handleResult(mc.runcmdEx(clearOrder), originTypeName)
  }
}

// 指令回调
const handleSweepCmdCallback = (cmd, origin, output, results) => {
  const { sweepType, delay } = results
  if (sweepType === SweepType.help) {
    output.success(`
    /swp item [delay] 清理掉落物 
    /swp skt [delay] 清理骷髅
    /swp any [delay] 清理所有生物(除玩家)
    /swp zb [delay] 清理僵尸
    /swp cp [delay] 清理苦力怕
    /swp spd [delay] 清理蜘蛛
    /swp zp [delay] 清理猪人
    /swp help 查看帮助

    括号内[delay]代表可选参数
    代表延时多久执行，类型为正整数，单位为分钟
    示例：/swp item 10 
    (该指令表示10分钟后清除服务器内所有掉落物)
  `)
  } else {
    handleClear(sweepType, delay)
  }
}

// 服务器启动后的回调
const handleOnServerStarted = () => {
  const sweepCmd = mc.newCommand(
    'sweep',
    '清扫指令，谁用谁知道。查看帮助请执行：/swp help',
    PermType.GameMasters
  )

  // 设置别名
  sweepCmd.setAlias('swp')

  // 定义枚举
  sweepCmd.setEnum('SweepType', [
    SweepType.item,
    SweepType.any,
    SweepType.skt,
    SweepType.zb,
    SweepType.spd,
    SweepType.cp,
    SweepType.zp
  ])
  sweepCmd.setEnum('Help', [SweepType.help])

  // 必选
  sweepCmd.mandatory('sweepType', ParamType.Enum, 'SweepType', 1)
  sweepCmd.mandatory('sweepType', ParamType.Enum, 'Help', 1)

  // 可选
  sweepCmd.optional('delay', ParamType.Int)

  // 重载指令
  sweepCmd.overload(['SweepType', 'delay'])
  sweepCmd.overload(['Help'])

  // 设置回调
  sweepCmd.setCallback(handleSweepCmdCallback)

  // 安装指令
  sweepCmd.setup()

  handleIntroduce()
}

// 插件介绍
const handleIntroduce = () => {
  log('插件加载完成')
  log('版本：v1.0.0')
  log('作者：mihu')
  log('更新时间：2022年3月11日18:10:27')
}
// 监听服务器启动
mc.listen('onServerStarted', handleOnServerStarted)
