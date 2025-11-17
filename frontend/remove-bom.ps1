$files = @(
  'src\contexts\AuthContext.tsx',
  'src\lib\hooks.ts',
  'src\lib\utils.ts',
  'src\components\atoms\Alert.tsx',
  'src\components\atoms\Avatar.tsx',
  'src\components\atoms\Badge.tsx',
  'src\components\atoms\Button.tsx',
  'src\components\atoms\Card.tsx',
  'src\components\atoms\Input.tsx',
  'src\components\molecules\StatsCard.tsx',
  'src\components\organisms\Header.tsx',
  'src\components\organisms\Sidebar.tsx',
  'src\components\templates\DashboardLayout.tsx',
  'src\app\produtos\page.tsx',
  'src\components\molecules\IADescriptionGenerator.tsx',
  'src\app\clientes\page.tsx',
  'src\app\configuracoes\page.tsx',
  'src\app\estoque\page.tsx',
  'src\app\financeiro\page.tsx',
  'src\app\vendas\page.tsx',
  'src\components\atoms\index.ts',
  'src\components\atoms\Spinner.tsx',
  'src\components\molecules\Charts.tsx',
  'src\contexts\QueryProvider.tsx',
  'src\types\index.ts'
)

foreach ($file in $files) {
  $fullPath = Join-Path $PSScriptRoot $file
  if (Test-Path $fullPath) {
    $content = Get-Content $fullPath -Raw
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
    Write-Host "Removido BOM de: $file"
  }
}

Write-Host "`nConcluído!"
