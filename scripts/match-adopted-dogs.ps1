[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$adoptedDogs = @('leila', 'lola', 'carly', 'button', 'tilika', 'multik', 't-800', 'lucky', 'angel')
$gridSize = 32

function Get-ImageFingerprint {
    param([string]$Path)
    try {
        $bytes = [System.IO.File]::ReadAllBytes($Path)
        $ms = New-Object System.IO.MemoryStream($bytes, 0, $bytes.Length)
        $img = [System.Drawing.Image]::FromStream($ms)

        # Handle EXIF
        $orientationId = 0x0112
        if ($img.PropertyIdList -contains $orientationId) {
            try {
                $prop = $img.GetPropertyItem($orientationId)
                $val = [BitConverter]::ToUInt16($prop.Value, 0)
                switch ($val) {
                    2 { $img.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
                    3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                    4 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
                    5 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
                    6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                    7 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
                    8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
                }
            } catch {}
        }

        $bmp = New-Object System.Drawing.Bitmap($gridSize, $gridSize)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::Bilinear
        $g.DrawImage($img, 0, 0, $gridSize, $gridSize)

        $pixels = New-Object double[] ($gridSize * $gridSize)
        $idx = 0
        for ($y = 0; $y -lt $gridSize; $y++) {
            for ($x = 0; $x -lt $gridSize; $x++) {
                $c = $bmp.GetPixel($x, $y)
                # Grayscale luminance
                $pixels[$idx] = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
                $idx++
            }
        }

        $g.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        $ms.Dispose()

        $sum = 0
        foreach ($p in $pixels) { $sum += $p }
        $mean = $sum / $pixels.Length
        $varSum = 0
        foreach ($p in $pixels) { $varSum += [Math]::Pow($p - $mean, 2) }
        $std = [Math]::Sqrt($varSum / $pixels.Length)
        if ($std -eq 0) { $std = 1 }

        $norm = New-Object double[] $pixels.Length
        for ($i = 0; $i -lt $pixels.Length; $i++) {
            $norm[$i] = ($pixels[$i] - $mean) / $std
        }

        return $norm
    } catch {
        return $null
    }
}

# 1. Fingerprint the 9 adopted dogs from static/images/animals
$targetFingerprints = @{}
foreach ($slug in $adoptedDogs) {
    $path = "static\images\animals\dog_$slug.jpg"
    if (Test-Path $path) {
        $targetFingerprints[$slug] = Get-ImageFingerprint $path
        Write-Host "Fingerprinted target: $slug ($path)"
    }
}

# 2. Dynamically locate the dog folder in .temp/photo-compression-for-AI
$tempBase = (Resolve-Path '.temp\photo-compression-for-AI').Path
$subdirs = Get-ChildItem -LiteralPath $tempBase -Directory
$dogDir = $subdirs | Where-Object { $_.Name -match '1|Собаки|Dog' } | Select-Object -First 1

if (-not $dogDir) {
    Write-Error "Could not find dog directory in $tempBase"
    exit 1
}

$candidateFiles = Get-ChildItem -LiteralPath $dogDir.FullName -File -Recurse | Where-Object { $_.Extension -match '\.jpe?g$' }
Write-Host "`nFingerprinting $($candidateFiles.Count) candidate files in $($dogDir.FullName)..."

$candidateFingerprints = @()
foreach ($file in $candidateFiles) {
    $fp = Get-ImageFingerprint $file.FullName
    if ($fp) {
        $candidateFingerprints += [PSCustomObject]@{
            FullName = $file.FullName
            RelPath = $file.FullName.Substring($tempBase.Length).TrimStart('\', '/')
            Fingerprint = $fp
        }
    }
}

Write-Host "`n=== BEST MATCHES FOR ADOPTED DOGS IN TEMP PHOTO ARCHIVE ==="

$matchedCleanPhotos = @{}

foreach ($slug in $adoptedDogs) {
    $targetFp = $targetFingerprints[$slug]
    if (-not $targetFp) { continue }

    $scores = @()
    foreach ($cand in $candidateFingerprints) {
        $dot = 0
        for ($i = 0; $i -lt $targetFp.Length; $i++) {
            $dot += $targetFp[$i] * $cand.Fingerprint[$i]
        }
        $corr = $dot / $targetFp.Length
        $scores += [PSCustomObject]@{
            RelPath = $cand.RelPath
            Score = [math]::Round($corr, 4)
            FullName = $cand.FullName
        }
    }

    $top = $scores | Sort-Object Score -Descending | Select-Object -First 3
    $best = $top | Select-Object -First 1
    $matchedCleanPhotos[$slug] = $best

    Write-Host "`nTarget: dog_$slug.jpg" -ForegroundColor Cyan
    foreach ($m in $top) {
        $color = if ($m.Score -gt 0.85) { "Green" } elseif ($m.Score -gt 0.70) { "Yellow" } else { "Gray" }
        Write-Host "  -> Score: $($m.Score) | $($m.RelPath)" -ForegroundColor $color
    }
}
