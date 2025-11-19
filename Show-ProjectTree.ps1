param(
    [int]$Depth = 3
)

# Exclude heavy folders
$exclude = @('node_modules', '.next', '.turbo', 'dist', 'build', '.git')

function Show-Tree($path, $level = 0) {
    if ($level -ge $Depth) { return }

    $items = Get-ChildItem $path | Where-Object { $exclude -notcontains $_.Name }
    foreach ($item in $items) {
        # Indentation
        $indent = ' ' * ($level * 4)

        if ($item.PSIsContainer) {
            # Folder: cyan + [DIR] marker
            Write-Host "$indent[DIR] $($item.Name)" -ForegroundColor Cyan
            Show-Tree $item.FullName ($level + 1)
        } else {
            # File type coloring
            switch -Regex ($item.Name) {
                '\.ts$'      { $color = 'Green'; $icon = '[TS]' }
                '\.tsx$'     { $color = 'Green'; $icon = '[TSX]' }
                '\.js$'      { $color = 'Yellow'; $icon = '[JS]' }
                '\.json$'    { $color = 'Magenta'; $icon = '[JSON]' }
                '\.md$'      { $color = 'Blue'; $icon = '[MD]' }
                '\.env'      { $color = 'DarkYellow'; $icon = '[ENV]' }
                default      { $color = 'Gray'; $icon = '[FILE]' }
            }
            Write-Host "$indent$icon $($item.Name)" -ForegroundColor $color
        }
    }
}

Show-Tree (Get-Location)
