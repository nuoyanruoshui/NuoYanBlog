# 从 safebooru 抓 SFW 纯风景图 -> raw/ -> 转 webp
# 用法： & .\scripts\gallery-fetch.ps1 -Album Scenery -Count 6

param(
  [string]$Album = "Scenery",
  [int]$Count = 6
)

$ErrorActionPreference = "Continue"
$UA = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"; "Referer" = "https://safebooru.org/" }
$root = "D:\Web\Hugo\Blog\NuoYanBlog"
$albumDir = Join-Path $root "public\images\albums\$Album"
$rawDir = Join-Path $albumDir "raw"
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

# 每组：查询标签（已含 no_humans，只要纯风景） + 文件名/标题用的中文
$queries = @(
  @{ q = "scenery+no_humans";             t1 = "风景"; t2 = "原野" },
  @{ q = "night+no_humans";               t1 = "夜色"; t2 = "静谧" },
  @{ q = "sky+clouds+no_humans";          t1 = "天空"; t2 = "云" },
  @{ q = "cherry_blossoms+no_humans";     t1 = "樱花"; t2 = "春日" },
  @{ q = "stars+no_humans";               t1 = "星空"; t2 = "夜幕" },
  @{ q = "sunset+no_humans";              t1 = "黄昏"; t2 = "余晖" },
  @{ q = "forest+no_humans";              t1 = "森林"; t2 = "绿意" },
  @{ q = "ocean+no_humans";               t1 = "海"; t2 = "远方" },
  @{ q = "water+no_humans";               t1 = "水边"; t2 = "倒影" },
  @{ q = "mountain+no_humans";            t1 = "山"; t2 = "云海" }
)

$existing = @{}
Get-ChildItem $albumDir -Filter *.webp -ErrorAction SilentlyContinue | ForEach-Object { $existing[$_.Name] = 1 }

$added = 0
$sourceLines = @()

foreach ($item in ($queries | Sort-Object { Get-Random })) {
  if ($added -ge $Count) { break }
  $page = Get-Random -Minimum 0 -Maximum 30
  $url = "https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=20&pid=$page&tags=$($item.q)+rating%3Asafe"
  try { $posts = Invoke-RestMethod -Uri $url -Headers $UA -TimeoutSec 25 } catch { continue }
  if (-not $posts) { continue }

  foreach ($p in ($posts | Sort-Object { Get-Random })) {
    if ($added -ge $Count) { break }
    $w = [int]$p.width; $h = [int]$p.height
    if ($w -lt 1200 -or $h -lt 700) { continue }
    $ratio = $w / $h
    if ($ratio -lt 1.2 -or $ratio -gt 2.4) { continue }   # 只要横构图

    $name = "$($item.t1)·$($item.t2)_$($item.t1)_$($item.t2)"
    if ($existing.ContainsKey("$name.webp")) { continue }

    $src = $p.sample_url
    if (-not $src) { $src = $p.file_url }
    $tmp = Join-Path $rawDir "$name.jpg"
    try {
      Invoke-WebRequest -Uri $src -Headers $UA -OutFile $tmp -TimeoutSec 60 -UseBasicParsing
      $existing["$name.webp"] = 1
      $added++
      $sourceLines += "- ``$name.webp`` — https://safebooru.org/index.php?page=post&s=view&id=$($p.id)"
      Write-Output ("✓ {0}  (id {1})" -f $name, $p.id)
    } catch {
      Write-Output ("✗ {0}: {1}" -f $name, $_.Exception.Message)
    }
    Start-Sleep -Milliseconds 400
  }
}

if ($sourceLines.Count -gt 0) {
  $srcPath = Join-Path $albumDir "SOURCE.md"
  $header = "# 图片来源`n`n全部来自 [safebooru](https://safebooru.org)（SFW），版权归各原作者所有，仅作个人收藏展示。`n`n"
  if (-not (Test-Path $srcPath)) {
    [System.IO.File]::WriteAllText($srcPath, $header, (New-Object System.Text.UTF8Encoding($false)))
  }
  [System.IO.File]::AppendAllText($srcPath, (($sourceLines -join "`n") + "`n"), (New-Object System.Text.UTF8Encoding($false)))
}

Write-Output "下载完成：$added 张，开始转换"
& node (Join-Path $root "scripts\gallery-convert.mjs") $albumDir

$coverPath = Join-Path $albumDir "cover.jpg"
$first = Get-ChildItem $albumDir -Filter *.webp | Select-Object -First 1
if ($first -and -not (Test-Path $coverPath)) {
  $f = $first.FullName.Replace('\','/'); $c = $coverPath.Replace('\','/')
  & node -e "const s=require('sharp');s('$f').resize(800,600,{fit:'cover'}).jpeg({quality:88}).toFile('$c').then(()=>console.log('cover.jpg ok'))"
}
