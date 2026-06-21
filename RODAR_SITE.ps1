# Z-CORE STANDALONE SERVER
# Versão otimizada para evitar erros de permissão

$frontendPath = Join-Path $PSScriptRoot "frontend"
$port = 8080

Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Z-CORE - SERVIDOR DE PRODUÇÃO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "STATUS: Rodando Nativo (Windows)" -ForegroundColor Yellow
Write-Host "PORTA:  $port" -ForegroundColor Yellow
Write-Host ""
Write-Host "ACESSE NO NAVEGADOR:" -ForegroundColor Green
Write-Host "http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Para parar o site: Feche esta janela ou aperte Ctrl+C" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$listener = New-Object System.Net.HttpListener
# Usando localhost especificamente para evitar pedidos de permissão de firewall/admin
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Servidor ativo! Aguardando você acessar http://localhost:8080" -ForegroundColor White
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }
        
        $filePath = Join-Path $frontendPath $urlPath.TrimStart("/")
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = "text/plain"
            
            switch ($extension) {
                ".html" { $mimeType = "text/html; charset=utf-8" }
                ".css"  { $mimeType = "text/css" }
                ".js"   { $mimeType = "application/javascript" }
                ".png"  { $mimeType = "image/png" }
                ".jpg"  { $mimeType = "image/jpeg" }
                ".jpeg" { $mimeType = "image/jpeg" }
                ".svg"  { $mimeType = "image/svg+xml" }
                ".ico"  { $mimeType = "image/x-icon" }
            }
            
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $mimeType
            $response.ContentLength64 = $fileBytes.Length
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "ERRO AO INICIAR: $_" -ForegroundColor Red
    Write-Host "`nTente clicar com o botão direito no arquivo 'INICIAR_SITE.bat' e 'Executar como Administrador' se o erro persistir." -ForegroundColor Yellow
    Pause
} finally {
    $listener.Stop()
}
