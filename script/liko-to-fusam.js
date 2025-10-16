let pluginSettings = {};
const subPlugins = [
  {
    id: "Liko_Tool",
    name: "Liko的工具包",
    en_name: "Liko's Tool Kit",
    description: "有許多小功能合集的工具包，但也有點不穩定",
    en_description: "A collection of small utility functions, but somewhat unstable",
    additionalInfo: "詳細使用說明請輸入/LT或/LT help查詢",
    en_additionalInfo: "For detailed usage instructions, please enter /LT or /LT help.",
    icon: "🧰",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Tool.main.user.js",
    enabled: pluginSettings["Liko_Tool"] ?? false,
    priority: 3
  },
  {
    id: "Liko_CPB",
    name: "Liko的自定義個人資料頁面背景",
    en_name: "Liko's Custom Profile Background",
    description: "自定義個人資料頁面背景並分享給他人",
    en_description: "Customize profile page background and share it with others.",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🪪",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20CPB.main.user.js",
    enabled: pluginSettings["Liko_CPB"] ?? false,
    priority: 3
  },
  {
    id: "Liko_Image_Uploader",
    name: "Liko的圖片上傳器",
    en_name: "Liko's Image Uploader",
    description: "拖曳上傳圖片並分享到聊天室",
    en_description: "Drag and drop image upload and share to chatroom",
    additionalInfo: "圖片上傳失敗時，可以使用/IMG或/IMG HELP查閱說明",
    en_additionalInfo: "If the image fails to upload, you can use /IMG or /IMG HELP to view the instructions.",
    icon: "🖼️",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Image%20Uploader.main.user.js",
    enabled: pluginSettings["Liko_Image_Uploader"] ?? true,
    priority: 3
  },
  {
    id: "Liko_CHE",
    name: "Liko的聊天室書記官",
    en_name: "Liko's Chat History Exporter",
    description: "聊天室信息轉HTML，並且提供最多7天的信息救援(需要手動啟用緩存功能)",
    en_description: "Convert chat history to HTML and provides message recovery for up to 7 days.(The caching feature requires manual activation.)",
    additionalInfo: "包含完整的聊天記錄、時間戳和角色信息，可以搭配Neocities等網站上傳分享",
    en_additionalInfo: "Includes complete chat logs, timestamps and character info, compatible with sites like Neocities for sharing",
    icon: "📋",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20CHE.main.user.js",
    enabled: pluginSettings["Liko_CHE"] ?? true,
    priority: 3
  },
  {
    id: "Liko_CDB",
    name: "Liko的自訂更衣室背景",
    en_name: "Liko's Custom Dressing Background",
    description: "更衣室背景替換，並提供網格對焦",
    en_description: "Replace wardrobe background with grid focus assistance",
    additionalInfo: "現在多了替換姿勢的功能",
    en_additionalInfo: "Now there is a function to change posture",
    icon: "👗",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20CDB.main.user.js",
    enabled: pluginSettings["Liko_CDB"] ?? true,
    priority: 3
  },
  {
    id: "Liko_Prank",
    name: "Liko對朋友的惡作劇",
    en_name: "Liko's Friend Prank",
    description: "內褲大盜鬧得BC社群人心惶惶！",
    en_description: "The underwear thief causing panic in the BC community!",
    additionalInfo: "注意：這是個惡作劇插件，請謹慎使用！指令 /偷取, /溶解, /传送",
    en_additionalInfo: "Warning: This is a prank plugin, use with caution! Command /Steal, /dissolve, /Teleport",
    icon: "🪄",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Prank.main.user.js",
    enabled: pluginSettings["Liko_Prank"] ?? false,
    priority: 5
  },
  {
    id: "Liko_NOI",
    name: "Liko的邀請通知器",
    en_name: "Liko's Notification of Invites",
    description: "發出好友、白單、黑單的信息!",
    en_description: "Customize the notification message when sending a friend, whitelist, or blacklist request.",
    additionalInfo: "可以使用/NOI或/NOI HELP查閱說明",
    en_additionalInfo: "For detailed usage instructions, please enter /NOI or /NOI help.",
    icon: "📧",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20NOI.main.user.js",
    enabled: pluginSettings["Liko_NOI"] ?? true,
    priority: 5
  },
  {
    id: "Liko_Bondage_renew",
    name: "Liko的捆綁刷新",
    en_name: "Liko's Bondage Refresh",
    description: "針對R120捆綁刷新不夠快的應急措施",
    en_description: "Emergency fix for slow bondage refresh in R120",
    additionalInfo: "修復版本更新後可能不再需要此插件",
    en_additionalInfo: "May no longer be needed after version updates",
    icon: "♻️",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Bondage%20renew.main.user.js",
    enabled: pluginSettings["Liko_Bondage_renew"] ?? false,
    priority: 10
  },
  {
    id: "Liko_Release_Maid",
    name: "Liko的解綁女僕",
    en_name: "Liko's Release Maid",
    description: "自動解綁女僕，不過有點天然，會在意外時觸發!",
    en_description: "Auto-release maid, but a bit naive and may trigger unexpectedly!",
    additionalInfo: "請評估自己需求，避免降低遊戲樂趣",
    en_additionalInfo: "Please consider your own needs to avoid diminishing the enjoyment of the game.",
    icon: "🧹",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Release%20Maid.main.user.js",
    enabled: pluginSettings["Liko_Release_Maid"] ?? false,
    priority: 10
  },
  {
    id: "Liko_Chat_TtoB",
    name: "Liko的對話變按鈕",
    en_name: "Liko's Chat Text to Button",
    description: "聊天室信息轉按鈕，現在還多了傳送門功能!",
    en_description: "Convert chat messages to buttons, now with portal feature!",
    additionalInfo: "使用/指令、!!說話、#房名#都會變成可以點擊的按鈕，#房名#提供傳送功能",
    en_additionalInfo: "Commands starting with /, !! for speech, and #RoomName# will become clickable buttons. The #RoomName# button provides a teleport function.",
    icon: "💬",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Chat%20TtoB.main.user.js",
    enabled: pluginSettings["Liko_Chat_TtoB"] ?? true,
    priority: 5
  },
  {
    id: "Liko_CDT",
    name: "Liko的座標繪製工具",
    en_name: "Liko's Coordinate Drawing Tool",
    description: "BC的介面UI定位工具，有開發需求的可以使用!",
    en_description: "BC interface UI positioning tool for developers!",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🖌️",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20CDT.main.user.js",
    enabled: pluginSettings["Liko_CDT"] ?? false,
    priority: 10
  },
  {
    id: "ECHO_cloth",
    name: "ECHO的服裝拓展",
    en_name: "ECHO's Expansion on cloth options",
    description: "ECHO的服裝拓展",
    en_description: "ECHO's Expansion on cloth options",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🥐",
    url: "https://SugarChain-Studio.github.io/echo-clothing-ext/bc-cloth.js",
    enabled: pluginSettings["ECHO_cloth"] ?? false,
    priority: 1
  },
  {
    id: "ECHO_activity",
    name: "ECHO的動作拓展",
    en_name: "ECHO's Expansion on activity options",
    description: "ECHO的動作拓展",
    en_description: "ECHO's Expansion on activity options",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🥐",
    url: "https://SugarChain-Studio.github.io/echo-activity-ext/bc-activity.js",
    enabled: pluginSettings["ECHO_activity"] ?? false,
    priority: 1
  },
  {
    id: "XSActivity",
    name: "小酥的動作拓展",
    en_name: "Liko's Coordinate Drawing Tool",
    description: "小酥的動作拓展",
    en_description: "XS's Expansion on activity options",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🍪",
    url: "https://iceriny.github.io/XiaoSuActivity/main/XSActivity.js",
    enabled: pluginSettings["XSActivity"] ?? false,
    priority: 2
  },
  {
    id: "Liko_ACV",
    name: "Liko的自動創建影片",
    en_name: "Liko's Automatically create video.",
    description: "Liko的自動創建影片",
    en_description: "Liko's Automatically create video.",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "🎬",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20ACV.main.user.js",
    enabled: pluginSettings["Liko_ACV"] ?? true,
    priority: 5
  },
  /*{
      id: "Liko_CMC",
      name: "Liko的聊天室音樂控制器",
      en_name: "Liko's Music Controller.",
      description: "支援歌詞(需要有曲名)、歌曲列表、flac等格式",
      en_description: "Supports lyrics (must have song title), song list, flac and other formats.",
      additionalInfo: "",
      en_additionalInfo: "",
      icon: "🎵",
      url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20CMC.main.user.js",
      enabled: pluginSettings["Liko_CMC"] ?? true,
      priority: 5
  },*/
  {
    id: "Liko - Region switch",
    name: "快速切換混合&女性區",
    en_name: "Region switch",
    description: "快速切換混合&女性區",
    en_description: "Region switch",
    additionalInfo: "",
    en_additionalInfo: "",
    icon: "⚧️",
    url: "https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/main/Liko%20-%20Region%20switch.main.user.js",
    enabled: pluginSettings["Liko - Region switch"] ?? true,
    priority: 10
  }
];

console.info(JSON.stringify(subPlugins.map(it => {
  return {
    "id": it.id,
    "icon": "https://raw.githubusercontent.com/awdrrawd/liko-tool-Image-storage/refs/heads/main/Images/LOGO_2.png",
    "name": it.name + ' —— ' + it.en_name,
    "description": it.description + '\n' + it.en_description,
    "author": "莉柯莉絲(Likolisu)",
    "repository": "https://github.com/awdrrawd/liko-Plugin-Repository",
    "tags": ["enhancements"],
    "type": "module",
    "noCacheBusting": true,
    "versions": [
      {
        "distribution": "stable",
        "source": "https://cdn.jsdelivr.net/gh/awdrrawd/liko-Plugin-Repository@main/" + it.url.substring('https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/'.length)
      }
    ]
  }
})))
