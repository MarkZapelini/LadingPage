# Servidor Super Simples na Porta 8080
$frontendPath = Join-Path $PSScriptRoot "frontend"
$port = 8080

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Servidor na Porta 8080 Iniciado!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ACESSE NO NAVEGADOR:" -ForegroundColor Green
Write-Host "http://localhost:8080/INDEX.HTML" -ForegroundColor Green
Write-Host ""
Write-Host "Para parar: pressione Ctrl+C" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Aguardando requisicoes..." -ForegroundColor DarkGray
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/INDEX.HTML" }
        $filePath = Join-Path $frontendPath $urlPath.TrimStart("/")
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pedido: $urlPath" -ForegroundColor DarkGray
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath)
            $mimeType = "text/plain"
            switch ($extension) {
                ".html" { $mimeType = "text/html" }
                ".css"  { $mimeType = "text/css" }
                ".js"   { $mimeType = "application/javascript" }
                ".png"  { $mimeType = "image/png" }
                ".jpg"  { $mimeType = "image/jpeg" }
                ".jpeg" { $mimeType = "image/jpeg" }
                ".gif"  { $mimeType = "image/gif" }
                ".svg"  { $mimeType = "image/svg+xml" }
                ".ico"  { $mimeType = "image/x-icon" }
            }
            
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mimeType
            $response.ContentLength64 = $fileBytes.Length
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = "<html><body><h1>404 - Arquivo nao encontrado</h1><p>Caminho: $urlPath</p><p>Arquivo: $filePath</p></body></html>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $response.ContentType = "text/html"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        
        $response.OutputStream.Close()
    }
} finally {
    try { $listener.Stop() } catch {}
    Write-Host ""
    Write-Host "Servidor parado!" -ForegroundColor Cyan
}
