[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$pairs = @(
    @{ Slug = 'leila';  RelPath = '1) Собаки\1\40.JPG' },
    @{ Slug = 'lola';   RelPath = '1) Собаки\1\19.JPG' },
    @{ Slug = 'carly';  RelPath = '1) Собаки\1\12.JPG' },
    @{ Slug = 'button'; RelPath = '1) Собаки\3\f785f9dc-cb4d-441e-a544-237c3ac4773f.JPG' },
    @{ Slug = 'tilika'; RelPath = '1) Собаки\3\f66062b3-b34e-414c-947a-7e1a188ac1db.JPG' },
    @{ Slug = 'multik'; RelPath = '1) Собаки\3\89112553-0652-457b-9983-15f7be325cf9.JPG' },
    @{ Slug = 't-800';  RelPath = '1) Собаки\4\IMG_0897.JPG' }
)

$sourceBase = (Resolve-Path '.temp\photo-source').Path
$destBase = (Resolve-Path 'static\images\animals').Path
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

$maxDim = 1200
$quality = 85

foreach ($p in $pairs) {
    $srcFile = Join-Path $sourceBase $p.RelPath
    $destFile = Join-Path $destBase "dog_$($p.Slug).jpg"

    if (-not (Test-Path $srcFile)) {
        Write-Error "File not found: $srcFile"
        continue
    }

    $rawBytes = [System.IO.File]::ReadAllBytes($srcFile)
    $ms = New-Object System.IO.MemoryStream($rawBytes, 0, $rawBytes.Length)
    $srcImg = [System.Drawing.Image]::FromStream($ms)

    # Handle EXIF
    $orientationId = 0x0112
    if ($srcImg.PropertyIdList -contains $orientationId) {
        try {
            $prop = $srcImg.GetPropertyItem($orientationId)
            $val = [BitConverter]::ToUInt16($prop.Value, 0)
            switch ($val) {
                2 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
                3 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
                4 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
                5 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
                6 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
                7 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
                8 { $srcImg.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
            }
        } catch {}
    }

    $w = $srcImg.Width
    $h = $srcImg.Height
    $scale = 1.0
    if ($w -gt $maxDim -or $h -gt $maxDim) {
        if ($w -gt $h) { $scale = $maxDim / $w } else { $scale = $maxDim / $h }
    }

    $newW = [Math]::Max(1, [int][Math]::Round($w * $scale))
    $newH = [Math]::Max(1, [int][Math]::Round($h * $scale))

    $destBmp = New-Object System.Drawing.Bitmap($newW, $newH)
    $graphics = [System.Drawing.Graphics]::FromImage($destBmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImg, 0, 0, $newW, $newH)

    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

    $outMs = New-Object System.IO.MemoryStream
    $destBmp.Save($outMs, $jpegCodec, $encoderParams)
    $savedBytes = $outMs.ToArray()

    [System.IO.File]::WriteAllBytes($destFile, $savedBytes)

    $outMs.Dispose()
    $encoderParams.Dispose()
    $graphics.Dispose()
    $destBmp.Dispose()
    $srcImg.Dispose()
    $ms.Dispose()

    $kb = [math]::Round($savedBytes.Length / 1KB, 1)
    Write-Host "Updated dog_$($p.Slug).jpg -> $kb KB (${newW}x${newH}) from $($p.RelPath)" -ForegroundColor Green
}
