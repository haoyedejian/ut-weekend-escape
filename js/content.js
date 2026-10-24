/* UT 周末出逃 · 只读内容包
   全部离线，无外部资源。照片为本地生成的 SVG 示意。 */
(function () {
  'use strict';
  window.UT = window.UT || {};

  function photo(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  var northPhoto = photo(
    "<svg xmlns='http://www.w3.org/2000/svg' width='720' height='360' viewBox='0 0 720 360'>" +
    "<rect width='720' height='360' fill='#DCE2D7'/>" +
    "<circle cx='536' cy='92' r='42' fill='#EDE7D6'/>" +
    "<path d='M0 238 C96 202 184 214 268 202 C366 188 458 214 552 208 C626 203 678 192 720 200 L720 360 L0 360Z' fill='#B9C6B7'/>" +
    "<path d='M0 272 C110 238 210 254 306 242 C404 230 500 254 594 246 C656 241 696 234 720 238 L720 360 L0 360Z' fill='#94A697'/>" +
    "<path d='M0 312 C130 284 238 300 342 288 C454 275 566 296 720 282 L720 360 L0 360Z' fill='#6F8274'/>" +
    "<g stroke='#5E7062' stroke-opacity='.32' stroke-width='2' stroke-linecap='round'>" +
    "<path d='M80 344 l5 -22'/><path d='M100 348 l9 -19'/><path d='M186 340 l4 -16'/>" +
    "<path d='M344 344 l8 -20'/><path d='M360 348 l3 -15'/><path d='M566 338 l6 -18'/><path d='M592 344 l10 -21'/>" +
    "</g></svg>"
  );

  var westPhoto = photo(
    "<svg xmlns='http://www.w3.org/2000/svg' width='720' height='360' viewBox='0 0 720 360'>" +
    "<rect width='720' height='360' fill='#E7E3D6'/>" +
    "<rect y='176' width='720' height='184' fill='#AAB6B2'/>" +
    "<path d='M0 208 C120 200 240 212 360 206 C480 200 600 210 720 204' fill='none' stroke='#C3CCC6' stroke-width='2'/>" +
    "<path d='M0 244 C130 236 260 248 390 242 C520 236 630 246 720 240' fill='none' stroke='#93A29F' stroke-width='3'/>" +
    "<path d='M0 292 C140 282 300 296 450 288 C560 282 650 290 720 286' fill='none' stroke='#879692' stroke-width='4'/>" +
    "<g stroke='#7B8580' stroke-width='2' fill='none'>" +
    "<line x1='470' y1='88' x2='470' y2='230'/><line x1='604' y1='112' x2='604' y2='216'/>" +
    "</g>" +
    "<path d='M470 96 l54 14 -54 17z' fill='#C6BAA0'/>" +
    "<path d='M604 120 l-40 11 40 14z' fill='#B9AE97'/>" +
    "<path d='M0 330 C160 322 320 332 480 326 C580 322 660 328 720 324' fill='none' stroke='#74837F' stroke-width='5'/>" +
    "</svg>"
  );

  var southPhoto = photo(
    "<svg xmlns='http://www.w3.org/2000/svg' width='720' height='360' viewBox='0 0 720 360'>" +
    "<rect width='720' height='360' fill='#E3E6DD'/>" +
    "<path d='M0 150 C60 122 110 138 168 126 C226 114 276 134 330 124 L330 360 L0 360Z' fill='#B7C2B4'/>" +
    "<path d='M430 132 C500 108 560 126 618 112 C664 101 694 108 720 102 L720 360 L430 360Z' fill='#ADBAAB'/>" +
    "<path d='M0 206 C90 186 160 200 236 190 C318 179 380 196 452 186 C530 175 620 190 720 178 L720 360 L0 360Z' fill='#8C9C89'/>" +
    "<path d='M248 360 C258 300 320 268 356 232 C392 196 430 182 474 176 C430 208 408 244 392 278 C374 318 372 340 376 360Z' fill='#BFCAC9'/>" +
    "<g fill='#7D8A7B'>" +
    "<ellipse cx='292' cy='300' rx='30' ry='13'/><ellipse cx='338' cy='326' rx='24' ry='11'/>" +
    "<ellipse cx='252' cy='262' rx='19' ry='9'/><ellipse cx='366' cy='248' rx='16' ry='8'/>" +
    "</g>" +
    "<g stroke='#6C7A68' stroke-width='2' stroke-linecap='round' opacity='.6'>" +
    "<path d='M82 360 C88 330 96 310 110 292'/><path d='M120 360 C126 332 134 318 148 304'/>" +
    "<path d='M600 360 C594 330 586 312 572 296'/><path d='M646 360 C640 334 632 318 618 306'/>" +
    "</g></svg>"
  );

  var personas = [
    {
      id: 'cloud',
      name: '观云人',
      line: '今天，你只负责看云。',
      permits: ['任意地方坐满二十分钟', '只拍天空，不拍地标', '云没散，就不回消息'],
      object: '一枚磨旧硬币',
      tendency: '开阔水面 / 草坡',
      handover: '“我只是路过。”',
      defaultCover: '云没有散，我也没回消息。'
    },
    {
      id: 'light',
      name: '拾光者',
      line: '收集这一天最后三束光。',
      permits: ['日落前不做计划', '追着光走', '允许迷路'],
      object: '一张空白明信片',
      tendency: '老街 / 江岸',
      handover: '“我在等最后一点光。”',
      defaultCover: '光落在旗子上，又落在我手上。'
    },
    {
      id: 'letter',
      name: '慢信使',
      line: '把一句没说出口的话带到另一个地方。',
      permits: ['给陌生人写一句话', '把信留在某个角落', '不问结果'],
      object: '一张信纸',
      tendency: '旧书店 / 小镇邮局',
      handover: '“这封信不是给我的。”',
      defaultCover: '信留在了那里，我没回头。'
    },
    {
      id: 'wander',
      name: '无名旅人',
      line: '不问路，只走。',
      permits: ['不打开地图', '岔路口凭直觉选', '向陌生人问一次路'],
      object: '一颗捡来的石子',
      tendency: '山径 / 村落',
      handover: '“前面是哪儿？都行。”',
      defaultCover: '走错了两次，但水声一直对。'
    },
    {
      id: 'moss',
      name: '苔藓观察员',
      line: '把速度降到苔藓的尺度。',
      permits: ['只走三公里', '观察微观自然十分钟', '只拍细节，不拍全景'],
      object: '一枚放大镜',
      tendency: '溪谷 / 森林公园',
      handover: '“我走得很慢。”',
      defaultCover: '今天只走了三公里，看了很久。'
    },
    {
      id: 'night',
      name: '夜航员',
      line: '在天黑之后重新认识一座城。',
      permits: ['只在日落后出门', '走一条没走过的街', '用一首歌走完一段路'],
      object: '一张旧车票',
      tendency: '城市夜路 / 24 小时书店',
      handover: '“现在还早。”',
      defaultCover: '这条街比白天更像一条街。'
    }
  ];

  var destinations = {
    north: {
      id: 'north',
      name: '北 · 草坡与水塘',
      short: '草坡水塘',
      direction: '北',
      duration: '1H 40',
      distance: '6KM',
      note: '风大，没有遮挡。走到水塘边就坐下。',
      anchor: [146, 224],
      previewPin: [130, 81],
      photo: northPhoto,
      fragments: [
        { kind: 'photo', caption: '风把草压向一边，我坐了很久。', time: 'SAT 11:20' },
        { kind: 'text', text: '这里的云比城里低。', time: 'SAT 15:04', place: '水塘边' }
      ]
    },
    west: {
      id: 'west',
      name: '西 · 老码头',
      short: '老码头',
      direction: '西',
      duration: '1H 10',
      distance: '3KM',
      note: '路很平，沿江走。傍晚风会往岸上吹。',
      anchor: [186, 160],
      previewPin: [166, 58],
      photo: westPhoto,
      fragments: [
        { kind: 'photo', caption: '江面把整个傍晚都收进去了。', time: 'SAT 11:40' },
        { kind: 'text', text: '旗子响了一下午。', time: 'SAT 15:20', place: '江岸' }
      ]
    },
    south: {
      id: 'south',
      name: '南 · 溪谷',
      short: '溪谷',
      direction: '南',
      duration: '2H 05',
      distance: '8KM',
      note: '有一段上坡。水声会一直跟着你。',
      anchor: [64, 272],
      previewPin: [57, 98],
      photo: southPhoto,
      fragments: [
        { kind: 'photo', caption: '水声一直在左边。', time: 'SAT 11:05' },
        { kind: 'text', text: '苔藓是湿的，像刚醒。', time: 'SAT 14:40', place: '石桥' }
      ]
    }
  };

  var presetCapsules = [
    {
      id: 'cap-1011',
      personaId: 'light',
      destinationId: 'west',
      dateLabel: '10.11',
      coverLine: '风把旗子吹得很响，我站了很久。',
      sealedAt: '2026-10-11T18:00:00+08:00',
      openAt: '2026-10-18T18:00:00+08:00',
      openedAt: '2026-10-19T09:12:00+08:00',
      status: 'opened',
      mapOffset: [28, -22],
      inside: '只记得旗子的声音，和一碗很烫的面。'
    },
    {
      id: 'cap-1004',
      personaId: 'wander',
      destinationId: 'south',
      dateLabel: '10.04',
      coverLine: '走错了两次，但水声一直对。',
      sealedAt: '2026-10-04T18:00:00+08:00',
      openAt: '2026-10-11T18:00:00+08:00',
      openedAt: '2026-10-12T20:05:00+08:00',
      status: 'opened',
      mapOffset: [-26, -18],
      inside: '溪水比想象中冷。石头带回来了，放在窗台上。'
    }
  ];

  window.UT.content = {
    personas: personas,
    destinations: destinations,
    destinationOrder: ['north', 'west', 'south'],
    presetCapsules: presetCapsules
  };
})();
