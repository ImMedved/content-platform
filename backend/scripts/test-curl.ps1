param(
    [string]$ApiBaseUrl = "http://127.0.0.1:5000/api/v1"
)

$ErrorActionPreference = "Stop"

$backendDir = Split-Path -Parent $PSScriptRoot
$serverProcess = $null
$startedServer = $false

function Wait-ForServer {
    param([string]$Url)

    for ($i = 0; $i -lt 20; $i++) {
        try {
            $null = & curl.exe -sS "$Url/"
            if ($LASTEXITCODE -eq 0) {
                return
            }
        } catch {
        }

        Start-Sleep -Seconds 1
    }

    throw "Backend server did not start in time."
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = ""
    )

    $args = @("-sS", "-X", $Method, "$ApiBaseUrl$Path")

    if ($Token) {
        $args += @("-H", "Authorization: Bearer $Token")
    }

    $tempFile = $null

    try {
        if ($null -ne $Body) {
            $tempFile = [System.IO.Path]::GetTempFileName()
            ($Body | ConvertTo-Json -Compress -Depth 10) | Set-Content -Path $tempFile -NoNewline
            $args += @("-H", "Content-Type: application/json")
            $args += @("--data-binary", "@$tempFile")
        }

        $raw = & curl.exe @args

        if ($LASTEXITCODE -ne 0) {
            throw "curl failed for $Method $Path"
        }

        try {
            $result = $raw | ConvertFrom-Json
        } catch {
            throw "Non-JSON response for ${Method} ${Path}: $raw"
        }

        if ($null -ne $result.error) {
            throw "API error for ${Method} ${Path}: $($result.error)"
        }

        return $result.data
    } finally {
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item -LiteralPath $tempFile
        }
    }
}

try {
    try {
        $null = & curl.exe -sS "http://127.0.0.1:5000/"
        if ($LASTEXITCODE -ne 0) {
            throw "No server"
        }
    } catch {
        $serverProcess = Start-Process -FilePath "node.exe" `
            -ArgumentList "src/server.js" `
            -WorkingDirectory $backendDir `
            -WindowStyle Hidden `
            -PassThru
        $startedServer = $true
        Wait-ForServer -Url "http://127.0.0.1:5000"
    }

    $suffix = Get-Date -Format "yyyyMMddHHmmssfff"

    $authorRegister = Invoke-Api -Method "POST" -Path "/auth/register" -Body @{
        username = "curl_author_$suffix"
        email = "curl_author_$suffix@test.com"
        password = "123456"
    }
    if (-not $authorRegister.userId) {
        throw "Author registration failed."
    }

    $readerRegister = Invoke-Api -Method "POST" -Path "/auth/register" -Body @{
        username = "curl_reader_$suffix"
        email = "curl_reader_$suffix@test.com"
        password = "123456"
    }
    if (-not $readerRegister.userId) {
        throw "Reader registration failed."
    }

    $authorLogin = Invoke-Api -Method "POST" -Path "/auth/login" -Body @{
        email = "curl_author_$suffix@test.com"
        password = "123456"
    }
    $readerLogin = Invoke-Api -Method "POST" -Path "/auth/login" -Body @{
        email = "curl_reader_$suffix@test.com"
        password = "123456"
    }

    $authorToken = $authorLogin.token
    $readerToken = $readerLogin.token

    if (-not $authorToken -or -not $readerToken) {
        throw "Login did not return tokens."
    }

    $authorMe = Invoke-Api -Method "GET" -Path "/users/me" -Token $authorToken
    $readerMe = Invoke-Api -Method "GET" -Path "/users/me" -Token $readerToken

    if (-not $authorMe.id -or -not $readerMe.id) {
        throw "User profile loading failed."
    }

    $null = Invoke-Api -Method "POST" -Path "/follow/$($authorMe.id)" -Token $readerToken

    $post = Invoke-Api -Method "POST" -Path "/posts" -Token $authorToken -Body @{
        title = "curl post $suffix"
        description = "created from curl smoke test"
        content = @(
            @{
                type = "text"
                value = "hello from curl"
            }
        )
        access = @{
            type = "free"
            price = 0
        }
    }

    if (-not $post.postId) {
        throw "Post creation failed."
    }

    $feed = Invoke-Api -Method "GET" -Path "/feed" -Token $readerToken
    if (-not ($feed | Where-Object { $_.id -eq $post.postId })) {
        throw "Feed does not contain followed author post."
    }

    $postDetail = Invoke-Api -Method "GET" -Path "/posts/$($post.postId)"
    if (-not $postDetail.post.id) {
        throw "Post detail endpoint failed."
    }

    $comment = Invoke-Api -Method "POST" -Path "/comments" -Token $readerToken -Body @{
        postId = $post.postId
        content = "curl comment"
    }

    if (-not $comment.commentId) {
        throw "Comment creation failed."
    }

    $comments = Invoke-Api -Method "GET" -Path "/comments/post/$($post.postId)"
    if (-not ($comments | Where-Object { $_.id -eq $comment.commentId })) {
        throw "Comment list does not contain created comment."
    }

    $null = Invoke-Api -Method "POST" -Path "/reactions" -Token $readerToken -Body @{
        postId = $post.postId
        type = "like"
    }

    $reactions = Invoke-Api -Method "GET" -Path "/reactions/$($post.postId)"
    if (-not ($reactions | Where-Object { $_.type -eq "like" })) {
        throw "Reaction list does not contain created reaction."
    }

    $null = Invoke-Api -Method "DELETE" -Path "/comments/$($comment.commentId)" -Token $readerToken
    $null = Invoke-Api -Method "DELETE" -Path "/reactions/$($post.postId)" -Token $readerToken
    $null = Invoke-Api -Method "DELETE" -Path "/follow/$($authorMe.id)" -Token $readerToken

    $profile = Invoke-Api -Method "GET" -Path "/users/$($authorMe.id)"
    if (-not ($profile.posts | Where-Object { $_.id -eq $post.postId })) {
        throw "Profile does not contain created post."
    }

    Write-Host "curl smoke tests passed."
} finally {
    if ($startedServer -and $serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id
    }
}
