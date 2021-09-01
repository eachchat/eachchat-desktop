!include "installer.nsh"

; 安装程序初始定义常量
!define MAIN_EXE_NAME				"EachChat"
!define LANCHER_EXE_NAME				"EachChat"
!define UNINSTALLER_NAME			"EachChat_Uninst.exe"

!define PRODUCT_UNINST_ROOT_HKCR	"HKCR"
!define PRODUCT_UNINST_ROOT_HKLM 	"HKLM"
!define PRODUCT_UNINST_ROOT_HKCU 	"HKCU"

!define PRODUCT_APP_REGKEY			"Software\${APPNAME}"
!define PRODUCT_LAUNCH_REGKEY 			"Software\Microsoft\Windows\CurrentVersion\App Paths\${LANCHER_EXE_NAME}.exe"
!define PRODUCT_DIR_REGKEY 			"Software\Microsoft\Windows\CurrentVersion\App Paths\${APPNAME}.exe"
!define PRODUCT_UNINST_KEY 			"Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
!define PRODUCT_STARTMENU_REGVAL 	"NSIS:StartMenuDir"
!define MULTIUSER_EXECUTIONLEVEL Highest

!define MyMutex_Install     "EachChat_Install"
!define MyMutex_UnInstall   "EachChat_UnInstall"

VAR product_install_dir

; 安装程序属性设置
SetDatablockOptimize on
SetCompressor /SOLID lzma

; 安装程序依赖的头文件
!include "MUI.nsh"
!include "x64.nsh"
!include "Library.nsh"
!include "FileFunc.nsh"
!include "Time.nsh"
!include "LogicLib.nsh"
!include "WordFunc.nsh"
!include "WinVer.nsh"
!include "MultiUser.nsh"
!include "WinMessages.nsh"
!include "UAC.nsh"

!insertmacro GetOptions
!insertmacro GetParameters
!insertmacro RefreshShellIcons

; MUI 预定义常量
!define MUI_ABORTWARNING
!define MUI_ICON ${MUI_ICON_PATH}
!define MUI_UNICON ${MUI_ICON_PATH}

; 欢迎页面
!define MUI_PAGE_CUSTOMFUNCTION_SHOW showWind
!define MUI_WELCOMEPAGE_TITLE "欢迎使用“${PRODUCT_NAME}”安装向导"
;!define MUI_WELCOMEPAGE_TEXT "456"
!insertmacro MUI_PAGE_WELCOME

; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY

; 安装过程页面
!insertmacro MUI_PAGE_INSTFILES

; 安装完成页面
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_TITLE "正在完成”${PRODUCT_NAME}“安装向导"
!define MUI_FINISHPAGE_RUN_TEXT "立即开始使用(&R)"
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchApp
!define MUI_FINISHPAGE_NOREBOOTSUPPORT
!insertmacro MUI_PAGE_FINISH

; 安装卸载过程页面
!insertmacro MUI_UNPAGE_INSTFILES

; 安装界面包含的语言设置
!insertmacro MUI_LANGUAGE "SimpChinese"

; 安装预释放文件
!insertmacro MUI_RESERVEFILE_INSTALLOPTIONS

; ------ MUI 现代界面定义结束 ------

; 文件详细信息
VIProductVersion ${PRODUCT_VERSION}
VIAddVersionKey	/LANG=2052 "ProductName" 		"${PRODUCT_NAME}"
VIAddVersionKey	/LANG=2052 "Comments" 			"This installation was built with NSIS setup."
VIAddVersionKey	/LANG=2052 "CompanyName" 		${PRODUCT_PUBLISHER}
VIAddVersionKey /LANG=2052 "ProductVersion"   	${PRODUCT_VERSION}
VIAddVersionKey	/LANG=2052 "LegalCopyright" 	"${PRODUCT_COPYRIGHT}"
VIAddVersionKey	/LANG=2052 "FileDescription" 	"${PRODUCT_NAME}安装程序"
VIAddVersionKey /LANG=2052 "FileVersion" 		"${PRODUCT_VERSION}"

; 安装过程中安装包弹出窗体标题栏名称
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"

; 输出的安装包文件名
OutFile "EachChat.exe"
InstallDir "$PROGRAMFILES\${APPSUBDIR}"
;InstallDir "$LOCALAPPDATA\${APPROOTDIR}\${APPSUBDIR}"

;配置默认安装
SilentInstall normal

;配置是否静默安装
!ifdef SILENT_INSTALL_ENABLE
	SilentInstall silent
	SilentUninstall silent
!endif

;该属性让安装程序去检测注册表里的一个字符串，如果该字符串可用那么把它用来作为安装目录
InstallDirRegKey ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_UNINST_KEY}" "UninstallString"

;设置显示安装详细信息和显示卸载详细信息
ShowInstDetails show
ShowUnInstDetails show

;设置显示在安装程序窗口底部的文本(默认为 'Nullsoft Install System vX.XX')。
BrandingText "${PRODUCT_NAME}"

;重要的并且必须的,不能使用admin模式！
RequestExecutionLevel user

; 初始化uac
!macro InitUAC do_what
uac_tryagain:
!insertmacro UAC_RunElevated
${Switch} $0
${Case} 0
	${IfThen} $1 = 1 ${|} Quit ${|} ;we are the outer process, the inner process has done its work, we are done
	${IfThen} $3 <> 0 ${|} ${Break} ${|} ;we are admin, let the show go on
	${If} $1 = 3 ;RunAs completed successfully, but with a non-admin user
		MessageBox mb_YesNo|mb_IconExclamation|mb_TopMost|mb_SetForeground "你的电脑应用权限受限，请联系系统管理员申请权限后重新${do_what}。" /SD IDNO IDYES uac_tryagain IDNO 0
	${EndIf}
	;fall-through and die
${Case} 1223
	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "${do_what}请求被取消，${do_what}被中止。$\r$\n请重新${do_what}，并选择同意设备更改。" /SD IDOK
	Quit
${Case} 1062
	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "系统相关服务没有启用，请检查你的电脑系统服务或联系服务商，启动运行后重新${do_what}。" /SD IDOK
	Quit
${Default}
	MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "系统错误$0，请联系技术人员处理后重新${do_what}。" /SD IDOK
	Quit
${EndSwitch}

SetShellVarContext all
!macroend

; 拷贝主资源文件
; 升级主资源文件直接覆盖安装
!macro CpAppSrc
    ; StrCpy $product_install_dir   "$INSTDIR\${PRODUCT_VERSION}"
    StrCpy $product_install_dir   "$INSTDIR"
    ; 拷贝|更新主资源
    SetOutPath "$product_install_dir"
  
    SetOverwrite try
	  File /r "win-unpacked\*"
	  ; File /r "win-ia32-unpacked\*"
!macroend

; 删除主资源文件
!macro CleanAppSrc
  ; 删除安装主目录
  RMDir /r "$INSTDIR"
!macroend

; 删除开始菜单及桌面快捷方式等额外资源
!macro CleanAdditionalIcons
	; 读取写入注册表的快捷方式名称
    ReadRegStr $0 ${PRODUCT_UNINST_ROOT_HKCU} ${PRODUCT_APP_REGKEY} "ShortcutName"

    SetShellVarContext all
	${IF} $0 != ""
		; 删除桌面快捷方式
        Delete "$DESKTOP\$0.lnk"

		; 删除开始菜单快捷方式
        Delete "$SMPROGRAMS\$0\卸载$0.lnk"
        Delete "$SMPROGRAMS\$0\$0.lnk"

		; 删除开始菜单组文件夹
        RMDir "$SMPROGRAMS\$0"
	${Else}
		; 删除桌面快捷方式
		Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"

		; 删除开始菜单快捷方式
		Delete "$SMPROGRAMS\${SHORTCUT_NAME}\卸载${SHORTCUT_NAME}.lnk"
		Delete "$SMPROGRAMS\${SHORTCUT_NAME}\${SHORTCUT_NAME}.lnk"
		RMDir "$SMPROGRAMS\${SHORTCUT_NAME}"
    ${EndIF}

	SetShellVarContext current
	${IF} $0 != ""
		; 删除桌面快捷方式
        Delete "$DESKTOP\$0.lnk"

		; 删除开始菜单快捷方式
        Delete "$SMPROGRAMS\$0\卸载$0.lnk"
        Delete "$SMPROGRAMS\$0\$0.lnk"

		; 删除开始菜单组文件夹
        RMDir "$SMPROGRAMS\$0"
	${Else}
		; 删除桌面快捷方式
		Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"

		; 删除开始菜单快捷方式
		Delete "$SMPROGRAMS\${SHORTCUT_NAME}\卸载${SHORTCUT_NAME}.lnk"
		Delete "$SMPROGRAMS\${SHORTCUT_NAME}\${SHORTCUT_NAME}.lnk"
		RMDir "$SMPROGRAMS\${SHORTCUT_NAME}"
    ${EndIF}
!macroend

; 删除系统注册表中的配置项
!macro CleanRegAppInfo
	; 删除写入的程序运行配置参数信息
	DeleteRegKey ${PRODUCT_UNINST_ROOT_HKCU} "${PRODUCT_APP_REGKEY}"
	DeleteRegKey ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_APP_REGKEY}"

	; 删除写入的程序卸载信息和安装目录信息
	DeleteRegKey ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_UNINST_KEY}"
	DeleteRegKey ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_DIR_REGKEY}"
	DeleteRegKey ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_LAUNCH_REGKEY}"
!macroend

!macro CleanUserInfo
	;删除用户配置文件
	MessageBox MB_YESNO|MB_DEFBUTTON1 "是否删除用户配置文件？" IDYES true IDNO false
	true:
	SetShellVarContext current
	RMDir /r "$APPDATA\EachChat"
	false:

!macroend

Section "主文件拷贝区段" mainSection
	; 安装|更新 主资源文件
	;call UnOldXsvr
	!insertmacro CleanAppSrc
	!insertmacro CpAppSrc
SectionEnd

Var /GLOBAL ShortCutLogo
Section "快捷方式创建区段" -AdditionalIcons
	StrCpy $ShortCutLogo "$product_install_dir\${SHORTCUT_ICON_PATH}"

	; 先删除开始菜单及桌面快捷方式
	!insertmacro CleanAdditionalIcons

    SetShellVarContext all
	; 创建开始菜单目录
	CreateDirectory "$SMPROGRAMS\${SHORTCUT_NAME}"

	; 创建开始菜单目录的打开程序快捷方式
	CreateShortCut "$SMPROGRAMS\${SHORTCUT_NAME}\${SHORTCUT_NAME}.lnk" "$INSTDIR\${LANCHER_EXE_NAME}.exe" "" $ShortCutLogo

	; 创建开始菜单目录的卸载程序快捷方式
    WriteUninstaller "$INSTDIR\${UNINSTALLER_NAME}"
	CreateShortCut "$SMPROGRAMS\${SHORTCUT_NAME}\卸载${SHORTCUT_NAME}.lnk" "$INSTDIR\${UNINSTALLER_NAME}" "" $ShortCutLogo

	; 删除NSIS默认生成的卸程序载快捷方式
    Delete "$SMPROGRAMS\${SHORTCUT_NAME}\卸载.lnk"

	; 桌面快捷方式
	CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${LANCHER_EXE_NAME}.exe" "" $ShortCutLogo

	; 刷新图标
	System::Call RefreshShellIcons
SectionEnd

Section "注册表写入区段" -WriteReg
	; 先删除写入注册表的程序信息
	!insertmacro CleanRegAppInfo

	; 再写入程序注册信息
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\${LANCHER_EXE_NAME}.exe"
	
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} "${PRODUCT_LAUNCH_REGKEY}" "" "$INSTDIR\${LANCHER_EXE_NAME}.exe"

	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "DisplayName" "$(^Name)"
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "UninstallString" "$INSTDIR\${UNINSTALLER_NAME}"
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "DisplayIcon" $ShortCutLogo
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "DisplayVersion" "${PRODUCT_VERSION}"
	;WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "URLInfoAbout" "${PRODUCT_WEB_SITE}"
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_UNINST_KEY} "Publisher" "${PRODUCT_PUBLISHER}"

	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_APP_REGKEY} "Version" ${PRODUCT_VERSION}
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKLM} ${PRODUCT_APP_REGKEY} "InstallPath" $INSTDIR
	WriteRegStr ${PRODUCT_UNINST_ROOT_HKCU} ${PRODUCT_APP_REGKEY} "ShortcutName" "${SHORTCUT_NAME}"

SectionEnd

Section "静默安装启动提示" ShowDlg
Push $R0
Push $R1
StrCpy $R1 ""
${GetParameters} $R0
${WordFind} $R0 "/S" +1 $R1
    ${If} $R1 != $R0
    MessageBox MB_OK "${PRODUCT_NAME}安装成功"
    ${EndIf} 

Pop $R1
Pop $R0
SectionEnd

/******************************
 *  以下是安装程序的卸载部分  *
 ******************************/

Section Uninstall
	; 删除开始菜单及桌面快捷方式
	!insertmacro CleanAdditionalIcons

	; 删除主资源文件
	!insertmacro CleanAppSrc

	; 删除写入注册表的程序信息
	!insertmacro CleanRegAppInfo

	;删除用户信息
	!insertmacro CleanUserInfo
	; 删除运行目录
	;SetShellVarContext current
	;RMDir /r "$APPDATA\EachChat"

	; 刷新图标
	System::Call RefreshShellIcons

	SetAutoClose true
SectionEnd

#-- 根据 NSIS 脚本编辑规则，所有 Function 区段必须放置在 Section 区段之后编写，以避免安装程序出现未可预知的问题。--#

Function .onInit
	; 尝试获取管理员权限来运行安装程序
	!insertmacro InitUAC "安装"

    Call CreateMutex
    
	; 检测主应用程序是否正在使用
${If} ${RunningX64}
    File /oname=$PLUGINSDIR\LockedList64.dll "${NSISDIR}\Plugins\LockedList64.dll"
${EndIf}
	LockedList::FindProcess /yesno "${MAIN_EXE_NAME}.exe"
	Pop $R0
	StrCmp $R0 "yes" 0 no_run
	MessageBox MB_OKCANCEL "程序正在运行，点击确定关闭程序完成安装，或取消安装" \
	IDOK ha
	Abort
	ha:
	LockedList::CloseProcess /kill "${MAIN_EXE_NAME}.exe"
	no_run:

FunctionEnd

Function un.onInit
    ; 尝试获取管理员权限来运行卸载程序
    !insertmacro InitUAC "卸载"

    Call Un.CreateMutex

    MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "您确实要完全移除 $(^Name) ，及其所有的组件？" IDYES +2
    Abort
${If} ${RunningX64}
    File /oname=$PLUGINSDIR\LockedList64.dll "${NSISDIR}\Plugins\LockedList64.dll"
${EndIf}
    LockedList::FindProcess /yesno "${MAIN_EXE_NAME}.exe"
    Pop $R0
    StrCmp $R0 "yes" 0 no_run
    MessageBox MB_OKCANCEL "程序正在运行，点击确定关闭程序完成卸载，或取消卸载" \
    IDOK todo
    Abort
    todo:
    LockedList::CloseProcess /kill "${MAIN_EXE_NAME}.exe"
    Sleep 1000
    no_run:
FunctionEnd

Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) 已成功地从您的计算机移除。"
FunctionEnd

Function LaunchApp
	; 启动应用
	!insertmacro UAC_AsUser_ExecShell "" "$INSTDIR\${LANCHER_EXE_NAME}.exe" "" "" ""
FunctionEnd

Function CreateMutex
    #检查安装互斥：#
    System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_Install}") i .R1 ?e'
    Pop $R0
    System::Call 'kernel32::CloseHandle(i R1) i.s'
    #检查卸载互斥：#
    System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_UnInstall}") i .R3 ?e'
    Pop $R2
    System::Call 'kernel32::CloseHandle(i R3) i.s'
    #判断安装/卸载互斥的存在#
    ${If} $R0 != 0
        MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME}安装程序已在运行！" /SD IDOK 
        Quit
    ${ElseIf} $R2 != 0
        MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME}卸载程序已在运行！" /SD IDOK 
        Quit
    ${Else}
        #创建安装互斥：#
        System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_Install}") i .R1 ?e'
        Pop $R0
        StrCmp $R0 0 +2
        Quit
    ${EndIf}
FunctionEnd

Function Un.CreateMutex
    #检查安装互斥：#
    System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_Install}") i .R1 ?e'
    Pop $R0
    System::Call 'kernel32::CloseHandle(i R1) i.s'
    #检查卸载互斥：#
    CheckUnInstall:
    System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_UnInstall}") i .R3 ?e'
    Pop $R2
    System::Call 'kernel32::CloseHandle(i R3) i.s'
    #判断安装/卸载互斥的存在#
    ${If} $R0 != 0
        MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME}安装程序已在运行！" /SD IDOK 
        Quit
    ${ElseIf} $R2 != 0
        MessageBox MB_OK|MB_ICONEXCLAMATION "${PRODUCT_NAME}卸载程序已在运行！" /SD IDOK 
        Quit
    ${Else}
        #创建卸载互斥：#
        System::Call 'kernel32::CreateMutexA(i 0, i 0, t "${MyMutex_UnInstall}") i .R1 ?e'
        Pop $R0
        StrCmp $R0 0 +2
        Quit
    ${EndIf}
FunctionEnd

Function showWind
	ShowWindow $HWNDPARENT ${SW_SHOW}
FunctionEnd
