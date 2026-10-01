Add-Type -AssemblyName System.Drawing

$images = Get-ChildItem "public/images" -File | Where-Object { $_.Extension -match '\.(png|jpg|jpeg)$' }
Write-Host "Found $($images.Count) images to check..."

$totalOriginal = 0
$totalNew = 0

foreach ($file in $images) {
    # Skip icons/logos with transparency that shouldn't be touched
    if ($file.Name -in @('logo.png', 'mascot.png', 'brand_logo_full.png')) {
        continue
    }

    $origSize = $file.Length
    $totalOriginal += $origSize

    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
        $w = $bmp.Width
        $h = $bmp.Height

        # If already reasonable size (< 200KB and <= 640px), keep it
        if ($origSize -lt 150000 -and $w -le 640 -and $h -le 640) {
            $bmp.Dispose()
            $totalNew += $origSize
            continue
        }

        # Calculate scaled dimensions (max 640)
        $maxDim = 640
        $scale = 1.0
        if ($w -gt $maxDim -or $h -gt $maxDim) {
            $scale = [Math]::Min($maxDim / $w, $maxDim / $h)
        }
        $newW = [int]($w * $scale)
        $newH = [int]($h * $scale)

        $newBmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $graphics = [System.Drawing.Graphics]::FromImage($newBmp)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graphics.DrawImage($bmp, 0, 0, $newW, $newH)
        $graphics.Dispose()
        $bmp.Dispose()

        # Save to temp path
        $tempPath = "$($file.FullName).tmp"
        if ($file.Extension -match '\.(jpg|jpeg)$') {
            $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
            $newBmp.Save($tempPath, $codec, $encoderParams)
            $encoderParams.Dispose()
        } else {
            # PNG format
            $newBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        $newBmp.Dispose()

        $newSize = (Get-Item $tempPath).Length
        # Only replace if new size is smaller
        if ($newSize -lt $origSize) {
            Move-Item $tempPath $file.FullName -Force
            $totalNew += $newSize
            $savedKB = [math]::Round(($origSize - $newSize) / 1024, 1)
            Write-Host "Optimized $($file.Name): $([math]::Round($origSize/1024,1))KB -> $([math]::Round($newSize/1024,1))KB (saved $savedKB KB)"
        } else {
            Remove-Item $tempPath -Force
            $totalNew += $origSize
        }
    } catch {
        Write-Warning "Failed to optimize $($file.Name): $_"
        $totalNew += $origSize
    }
}

$origMB = [math]::Round($totalOriginal / 1024 / 1024, 2)
$newMB = [math]::Round($totalNew / 1024 / 1024, 2)
$savedMB = [math]::Round(($totalOriginal - $totalNew) / 1024 / 1024, 2)
Write-Host "Done! Original: $origMB MB | New: $newMB MB | Saved: $savedMB MB"
