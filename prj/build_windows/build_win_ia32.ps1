if ($args.Count -eq 1)
{
    $curVersion = $args[0]
}
$buildWindows = Split-Path -Parent $MyInvocation.MyCommand.Definition;
$prj = Split-Path -Parent $buildWindows;
$build = Join-Path $prj "build";
$nsisPath = Join-Path $build "windows_installer_1a32.nsi";
$nshPath = Join-Path $build "installer.nsh";
$distPath = Join-Path $build "win-ia32-unpacked";
$root = Split-Path -Parent $prj;
$workgit = Split-Path -Parent $root;
$d = Split-Path -Parent $workgit;
$tools = Join-Path $d "tools";
$sign = Join-Path $tools "sign";
$nsis = Join-Path $tools "NSIS";

cd $prj;
# echo "Start Build Electron."
# yarn run build;

echo "Sign"
cd $sign;
./SignBatch.bat $build\win-ia32-unpacked;

cd $nsis;
Copy-Item $prj\build_windows\windows_installer_1a32.nsi $build\ -Force -Recurse;
Copy-Item $prj\build_windows\installer.nsh $build\ -Force -Recurse;
Copy-Item $prj\build_windows\logo3.ico $build\ -Force -Recurse;
Copy-Item $prj\build_windows\logo3.ico $distPath\ -Force -Recurse;
$TimeStr = Get-Date -Format "yyyyMMddHH"
$file = Get-Content $nshPath;
(Get-Content $nshPath -raw) -replace '!define PRODUCT_VERSION',('!define PRODUCT_VERSION "'+$curVersion+'.'+$TimeStr+'"') | Set-Content $nshPath

./makensis.exe $nsisPath;

cd $sign;
./SignBatch.bat $build\EachChat.exe;