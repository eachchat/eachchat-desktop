@echo off
set describe=:
set describeURL=:


set tsurl=http://timestamp.verisign.com/scripts/timstamp.dll
set signtool=%~dp0tool/signtool.exe

set tsurl=http://timestamp.comodoca.com/authenticode
set tsurl2=http://sha256timestamp.ws.symantec.com/sha256/timestamp
set signtool=%~dp0tool/signtool_win10.exe



set msgbox="%~dp0msg.vbs"
if exist %msgbox% goto findtool
echo on error resume next>%msgbox%
echo canshu = wscript.arguments(0)>>%msgbox%
echo if canshu = "" Then>>%msgbox%
echo msgbox "无参数">>%msgbox%
echo elseif canshu = "/NoSigntool" then>>%msgbox%
echo msgbox "Signtool程序缺失，您可能需要重新下载签名工具。"+vbCrlf+""+vbCrlf+"请检查程序完整性后重试。"+vbCrlf+""+vbCrlf+" 	                     	程序即将退出",,"signtool 错误">>%msgbox%
echo elseif canshu = "/NoCross" then>>%msgbox%
echo msgbox "交叉签名证书MS-Thawte-Cross.cer丢失，这将导致64位驱动签名失败。"+vbCrlf+""+vbCrlf+"忽略错误可继续签名非64位内核驱动程序。",,"signtool 错误">>%msgbox%
echo else>>%msgbox%
echo Msgbox "参数不正确">>%msgbox%
echo end if>>%msgbox%

:findtool
if not exist "%signtool%" (
	%msgbox% /NoSigntool
	goto :willend
)

:setinput
if exist %~sdp0list.txt del %~sdp0list.txt /q /s >nul
if exist %~sdp0syslst.txt del %~sdp0syslst.txt /q /s >nul

set input=%1%

if not exist "%input%" (
	%msgbox% /errorpath
	goto :willend
)

set param_url=
set param_desc=

if NOT "%describe%"==":" set param_desc= /d "%describe%" 
if NOT "%describeURL%"==":" set param_url= /du "%describeURL%" 

set cer="%~dp0MS-Thawte-Cross.cer"
if not exist %cer% (
    echo -----BEGIN CERTIFICATE----->%cer%
    echo MIIFeTCCA2GgAwIBAgIKYR+wpAAAAAAAHTANBgkqhkiG9w0BAQUFADB/MQswCQYD>>%cer%
    echo VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe>>%cer%
    echo MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQDEyBNaWNyb3Nv>>%cer%
    echo ZnQgQ29kZSBWZXJpZmljYXRpb24gUm9vdDAeFw0xMTAyMjIxOTMxNTdaFw0yMTAy>>%cer%
    echo MjIxOTQxNTdaMIGpMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMdGhhd3RlLCBJbmMu>>%cer%
    echo MSgwJgYDVQQLEx9DZXJ0aWZpY2F0aW9uIFNlcnZpY2VzIERpdmlzaW9uMTgwNgYD>>%cer%
    echo VQQLEy8oYykgMjAwNiB0aGF3dGUsIEluYy4gLSBGb3IgYXV0aG9yaXplZCB1c2Ug>>%cer%
    echo b25seTEfMB0GA1UEAxMWdGhhd3RlIFByaW1hcnkgUm9vdCBDQTCCASIwDQYJKoZI>>%cer%
    echo hvcNAQEBBQADggEPADCCAQoCggEBAKyg8PuAWdScx6TPnaFZcwkQRQwNLG5o8Wxb>>%cer%
    echo SGhJWTf8CzMZwnd/zBAtlTQc5utNCacc0rjJlzYCt4nUJF8GwMxElJSNAmJv61rd>>%cer%
    echo EY0omlyEkBB6Db10Zi9qOKDi1VRE6x0Hnwe6b+7p/U4LKfU+hKAB8Zyr+Bx+iaTo>>%cer%
    echo odhxZQ2jUXvuvNIiYA25W53fuvxRWwuvmLLpLukE6GKH3ivI107BTGQe3c+HWLpK>>%cer%
    echo T8poBx0cnUrG1S+RzHxxchzFwGfrMv3JklyU2oXAm79TfSsJ9IydkR+XalLL3gk2>>%cer%
    echo pHfYe4dQRNU+bilp+zlJJh4JpYB7QC3r6CeFyf5h/X7mfJcd1Z0CAwEAAaOByzCB>>%cer%
    echo yDARBgNVHSAECjAIMAYGBFUdIAAwDwYDVR0TAQH/BAUwAwEB/zALBgNVHQ8EBAMC>>%cer%
    echo AYYwHQYDVR0OBBYEFHtbRc+vzst6/TGSGmq280brV0hQMB8GA1UdIwQYMBaAFGL7>>%cer%
    echo CiFbf0NuEdoJVFBr9dKWcfGeMFUGA1UdHwROMEwwSqBIoEaGRGh0dHA6Ly9jcmwu>>%cer%
    echo bWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY3Jvc29mdENvZGVWZXJp>>%cer%
    echo ZlJvb3QuY3JsMA0GCSqGSIb3DQEBBQUAA4ICAQAtzHG16LqU/17mRGcAe2r8QSw+>>%cer%
    echo 5w5BhVqxKpMrqVuJ8vcrSZyAA/KXuOdgqA7X/V3lRUZ1lPTtHJ3hZiKLYfsp8sao>>%cer%
    echo vfOHyY9/R+HAWLZKGqLn9xhgaWnggwaeJsd1xAwNedp0a1K5+ujqM1m5uxjdKRoU>>%cer%
    echo 39NqNyd6naDaz//8IsT68An/M+k+F7ocx0LPzidD0wwMVYEwPblgYM4C7OGe6B3c>>%cer%
    echo hSzgoY2WbZWsF6RxPqFnQbYoHSzjthXlt+Wi9iVthuMgrPn4MU+OYpuYMzdtavc1>>%cer%
    echo Uj6Q/rA7X8W4UqngbqBHmieel66iSp5TGTnsNX7GWd464Kr1M/BqvaCCGBLeoYxF>>%cer%
    echo cMor1i6VkUWZWlwkAEm9I7MM7KQ99bnh0bGCWjjuo/uhq0g6jF3/oGUiP9PT/kmQ>>%cer%
    echo 2xRGo4UuilVLCas4sqtjoAjR/a1I4nPYErzCbKUW+tCawF44ODorcY5VOqxCGXof>>%cer%
    echo DUIg56tdjGiAUkyhwNSI0CMh+5ATCQB7STevqd9IYCKr9PbCNjv4UTw0u8WG5Drh>>%cer%
    echo n0uQ/lRhAksVnDQXaqlLjUy2nSMmyDrx1rgFzdodYkAYOi8bQc06mToKqdHXfrjE>>%cer%
    echo r/e4yYAQXtVd9s56mgLFD2OB77Vk6fxb2NJhmmjDfPnHjfkeh9X6LPgWrp2rBo/I>>%cer%
    echo bcdBzaFOhOPawm68+w==>>%cer%
    echo -----END CERTIFICATE----->>%cer%
)



pushd "%input%">nul 2>nul && (popd & set folder=yes)||(set folder=no)

rem 上面这句判断用户输入的是一个文件夹还是一个文件
goto multifile%folder%


rem 如果输入的是一个文件

:multifileno
rem cls
echo.
echo.
Echo          ----------------------------------------------------------
Echo                          单个代码添加签名模式开始
Echo          ----------------------------------------------------------
echo.

::if %input:~-4%==.sys goto syssign
::if %input:~-4%==.cat goto syssign

echo %input%>%~sdp0list.txt
goto choice1

:::syssign
::echo %input%>%~sdp0syslst.txt

:choice1
goto :realsign

rem 如果输入的是一个文件夹
:multifileyes
echo.
echo.
Echo          ----------------------------------------------------------
Echo                          批量代码添加签名模式开始
Echo          ----------------------------------------------------------
echo.

for /r "%input%" %%i in (*.exe *.dll *.cab *.ocx *.mui *.vbs *.msi *.sys *.cat) do echo %%~fi>>%~sdp0list.txt
::for /r "%input%" %%i in (*.sys *.cat) do echo %%~fi>>%~sdp0syslst.txt

:realsign
setlocal enableDelayedExpansion

if not exist %~sdp0list.txt (
	::if not exist %~sdp0syslst.txt (
		%msgbox% /errorpath
		goto :willend
	::)
	::goto syslist
)

echo 操作系统版本
ver | findstr /r /i " [版本 10.0.*]" && goto dosignlist
::h5打包平台是win server，这里只针对打包平台版本做了处理。如果打包平台系统版本有调整这里需要修改
ver | findstr /r /i " [版本 6.2.*]" && goto dosignlistonlyone
ver | findstr /r /i " [版本 5.1.*]" && goto dosignlistxp

:dosignlist
echo 双签名
del /q /f %~sdp0listfail.txt 1>nul 2>nul
for /f "delims=" %%1 in (%~sdp0list.txt) do (
    echo Sign: %%~nx1 ...
    "%signtool%" sign /t "%tsurl%" "%%~1" 1>%~dps0std.log 2>%~dps0err.log
    "%signtool%" sign /as /fd sha256 /tr "%tsurl2%" "%%~1" 1>>%~dps0std.log 2>>%~dps0err.log
    findstr .* "%~dps0std.log"
    findstr .* "%~dps0err.log"
    for %%a in (%~dps0err.log) do if not %%~za==0 echo %%~1 >>%~sdp0listfail.txt
    echo.
)
del %~sdp0list.txt /f /q 1>nul 2>nul
if exist %~sdp0listfail.txt (
    rename %~sdp0listfail.txt list.txt 1>nul 2>nul
    goto dosignlist
)
goto willend

:dosignlistonlyone
echo 单签名
del /q /f %~sdp0listfail.txt 1>nul 2>nul
for /f "delims=" %%1 in (%~sdp0list.txt) do (
    echo Sign: %%~nx1 ... sign /f "%pfxfilesource%" /p "%pfxpasswd%" %param_desc% %param_url% /t "%tsurl%" "%%~1"
    "%signtool%" sign /f "%pfxfilesource%" /p "%pfxpasswd%" %param_desc% %param_url% /t "%tsurl%" "%%~1" 1>%~dps0std.log 2>%~dps0err.log
    findstr .* "%~dps0std.log"
    findstr .* "%~dps0err.log"
    for %%a in (%~dps0err.log) do if not %%~za==0 echo %%~1 >>%~sdp0listfail.txt
    echo.
)
del %~sdp0list.txt /f /q 1>nul 2>nul
if exist %~sdp0listfail.txt (
    rename %~sdp0listfail.txt list.txt 1>nul 2>nul
    goto dosignlistonlyone
)
goto willend

:dosignlistxp
echo xp签名

set tsurl=http://timestamp.verisign.com/scripts/timstamp.dll
set signtool=%~dp0tool/signtool.exe

del /q /f %~sdp0listfail.txt 1>nul 2>nul
for /f "delims=" %%1 in (%~sdp0list.txt) do (
    echo Sign: %%~nx1 ...
    "%signtool%" sign /f "%pfxfilesource%" /p "%pfxpasswd%" %param_desc% %param_url% /t "%tsurl%" "%%~1" 1>%~dps0std.log 2>%~dps0err.log
    findstr .* "%~dps0std.log"
    findstr .* "%~dps0err.log"
    for %%a in (%~dps0err.log) do if not %%~za==0 echo %%~1 >>%~sdp0listfail.txt
    echo.
)
del %~sdp0list.txt /f /q 1>nul 2>nul
if exist %~sdp0listfail.txt (
    rename %~sdp0listfail.txt list.txt 1>nul 2>nul
    goto dosignlistonlyone
)

:willend
if exist %~sdp0std.log del %~sdp0std.log /q /f 1>nul 2>nul
if exist %~sdp0err.log del %~sdp0err.log /q /f 1>nul 2>nul
if exist %~sdp0list.txt del %~sdp0list.txt /q /f 1>nul 2>nul
if exist %~sdp0syslst.txt del %~sdp0syslst.txt /q /f 1>nul 2>nul
if exist %msgbox% del %msgbox% /q /f 1>nul 2>nul
if exist "%~dp0MS-Thawte-Cross.cer" del "%~dp0MS-Thawte-Cross.cer" /q /f 1>nul 2>nul

