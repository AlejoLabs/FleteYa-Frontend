$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$shortPath = 'C:\idr'

if (Test-Path $shortPath) {
  $item = Get-Item $shortPath
  if (-not $item.Attributes.ToString().Contains('ReparsePoint')) {
    throw "Path $shortPath exists and is not a junction. Remove or rename it and try again."
  }
} else {
  cmd /c "mklink /J $shortPath \"$projectRoot\"" | Out-Null
}

Push-Location $shortPath
try {
  npx expo run:android
} finally {
  Pop-Location
}
