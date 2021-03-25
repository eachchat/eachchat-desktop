---
mac 打包
---

# 关于证书
- 非上传到AppStore 使用前缀为: Developer ID Application 的证书
- 上传到AppStore 使用前缀为: 3rd Party Mac Developer Installer, 3rd Party Mac Developer Application: 的两种证书

> 关于证书不可信问题，确保 keychain 中 `Apple Worldwide Developer Relations Certification Authority`证书与签名需要的证书在同一模块。推荐就放在登录模块  
   
证书下载地址 https://developer.apple.com/account/resources/



# Build for non upload Appstore cases
修改点：
    1.electron-builder需要升级到21.2.0，然后这个版本的builder在做签名时候会有bug，
    需要对node_modules/app-builder-lib/electron-osx-sign/sign.js做修改。
    可用同级目录中的sign.js做替换
### 开始   
> yarn build



# Build for upload AppStore
### 前提 
1. 确保`prj/build/mac`路径下有等待打包的app
2. 取保两个证书在 keychain
`3rd Party Mac Developer Installer: Beijing Workly Ai Technology Co., Ltd (FU9J7J29L2)`------- `3rd Party Mac Developer Application: Beijing Workly Ai Technology Co., Ltd (FU9J7J29L2)`

### 开始
> yarn build:pkg


参考链接：https://github.com/electron/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md
- bash脚本签名可以覆盖签名，不用担心之前对app的签名的影响


---
---

## 上传Appstore 对应报错与解决参考

> ERROR ITMS-90236: "Missing required icon. The application bundle does not contain an icon in ICNS format, containing both a 512x512 and a 512x512@2x image. For further assistance, see the Apple Human Interface Guidelines at https://developer.apple.com/macos/human-interface-guidelines/icons-and-images/app-icon"

tmp.iconset 文件不规范， 使用一张 1024*1024 的图片可以生成
1. 准备一个 1024 * 1024 的png图片，假设名字为 pic.png
2. 命令行 $ mkdir tmp.iconset，创建一个临时目录存放不同大小的图片
3. 把原图片转为不同大小的图片，并放入上面的临时目录
全部拷贝到命令行回车执行，执行结束之后去tmp.iconset查看十张图片是否生成好
sips -z 16 16     pic.png --out tmp.iconset/icon_16x16.png
sips -z 32 32     pic.png --out tmp.iconset/icon_16x16@2x.png
sips -z 32 32     pic.png --out tmp.iconset/icon_32x32.png
sips -z 64 64     pic.png --out tmp.iconset/icon_32x32@2x.png
sips -z 128 128   pic.png --out tmp.iconset/icon_128x128.png
sips -z 256 256   pic.png --out tmp.iconset/icon_128x128@2x.png
sips -z 256 256   pic.png --out tmp.iconset/icon_256x256.png
sips -z 512 512   pic.png --out tmp.iconset/icon_256x256@2x.png
sips -z 512 512   pic.png --out tmp.iconset/icon_512x512.png
sips -z 1024 1024   pic.png --out tmp.iconset/icon_512x512@2x.png
4 通过iconutil生成icns文件 $ iconutil -c icns tmp.iconset -o Icon.icns，此时你的目录应该有了你想要的 O(∩_∩)O


>ERROR ITMS-90237: "The product archive package's signature is invalid. Ensure that it is signed with your "3rd Party Mac Developer Installer" certificate."

证书错误，确保证书（keychain中存在，可信任）

>ERROR ITMS-90277: "Invalid Bundle Identifier. The application bundle contains a tool or framework Electron Helper (GPU) [ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/EachChat Helper (GPU).app] using the bundle identifier 'ai.workly.eachchat.helper.(GPU)', which is not a valid bundle identifier."

对应文件漏签名

>ERROR ITMS-90296: "App sandbox not enabled. The following executables must include the "com.apple.security.app-sandbox" entitlement with a Boolean value of true in the entitlements property list: [( "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/EachChat Helper (GPU).app/Contents/MacOS/EachChat Helper (GPU)", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/EachChat Helper (Plugin).app/Contents/MacOS/EachChat Helper (Plugin)", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/EachChat Helper (Renderer).app/Contents/MacOS/EachChat Helper (Renderer)", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/EachChat Helper.app/Contents/MacOS/EachChat Helper", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt", "ai.workly.eachchat.pkg/Payload/EachChat.app/Contents/MacOS/EachChat" )] Refer to App Sandbox page at https://developer.apple.com/documentation/security/app_sandbox for more information on sandboxing your app."

对应文件漏签名， 使用 `<key>com.apple.security.app-sandbox</key>
    <true/>` 的 .plist 文件对其签名



