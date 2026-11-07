# Pathform video studio: Windows one-time setup.
# Run in PowerShell (not as admin unless winget asks):   powershell -ExecutionPolicy Bypass -File setup\windows-setup.ps1
# READ IT FIRST. It only installs from winget's official package IDs and the project's own pinned lockfiles.
# NOT TESTED ON WINDOWS by the assistant (it was written from a Linux cloud box). If a step fails, paste the red error to Claude.

$ErrorActionPreference = "Stop"
function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User") }

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget not found. Update 'App Installer' from the Microsoft Store, then re-run." -ForegroundColor Red; exit 1
}

# id, friendly name, command that proves it's installed
$apps = @(
  @{id="Git.Git";                       name="Git";            cmd="git"},
  @{id="OpenJS.NodeJS.LTS";             name="Node.js LTS";    cmd="node"},
  @{id="Python.Python.3.12";            name="Python 3.12";    cmd="py"},
  @{id="Gyan.FFmpeg";                   name="FFmpeg";         cmd="ffmpeg"},
  @{id="Microsoft.VisualStudioCode";    name="VS Code";        cmd="code"},
  @{id="Obsidian.Obsidian";             name="Obsidian";       cmd=$null}
)
Step "Installing apps (skips anything already installed)"
foreach ($a in $apps) {
  if ($a.cmd -and (Get-Command $a.cmd -ErrorAction SilentlyContinue)) { Write-Host "$($a.name): already installed"; continue }
  Write-Host "Installing $($a.name) ($($a.id))..."
  winget install --id $a.id -e --silent --accept-package-agreements --accept-source-agreements
}
Refresh-Path

Step "Getting the project"
$root = Join-Path $HOME "Pathform"
if (-not (Test-Path $root)) { git clone https://github.com/GfdGSDAGDSGFDAA/Myfirstrepo- $root }
Set-Location $root
git fetch origin claude/tender-albattani-ujjnrp
git checkout claude/tender-albattani-ujjnrp
git pull origin claude/tender-albattani-ujjnrp

Step "Security check: do all dependencies exist, look legit, and are pinned?"
py -3.12 pipeline\verify_deps.py
if ($LASTEXITCODE -ne 0) { Write-Host "verify_deps FAILED. Stop and show Claude the output." -ForegroundColor Red; exit 1 }

Step "Installing Remotion + JS deps from the hash-locked lockfile (npm ci, not npm install)"
Push-Location studio; npm ci; Pop-Location

Step "Python environment"
py -3.12 -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r pipeline\requirements.txt

Step "Downloading open models (about 1 GB; Kokoro voice, Whisper, Parakeet)"
New-Item -ItemType Directory -Force models | Out-Null
Push-Location models
$base = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
$sh   = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models"
foreach ($f in @("$base/kokoro-v1.0.onnx", "$base/voices-v1.0.bin")) { if (-not (Test-Path (Split-Path $f -Leaf))) { curl.exe -L -O $f } }
foreach ($n in @("sherpa-onnx-whisper-small.en", "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8")) {
  if (-not (Test-Path $n)) { curl.exe -L -O "$sh/$n.tar.bz2"; tar -xjf "$n.tar.bz2"; Remove-Item "$n.tar.bz2" }
}
Pop-Location

Step "ElevenLabs key (optional, press Enter to skip)"
Write-Host "Get it at elevenlabs.io > your profile > API Keys. It is stored ONLY as a Windows user environment variable."
Write-Host "NEVER paste it into a chat or a file."
$sec = Read-Host "ELEVENLABS_API_KEY" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if ($plain) { [Environment]::SetEnvironmentVariable("ELEVENLABS_API_KEY", $plain, "User"); Write-Host "Saved. Open a NEW terminal for it to take effect." }
else { Write-Host "Skipped." }

Step "DONE"
Write-Host "Project folder: $root"
Write-Host "1) Start Remotion Studio (live preview):   cd $root\studio ; npx remotion studio"
Write-Host "2) Obsidian: Open folder as vault > $root\Pathform-Vault"
Write-Host "3) Official Remotion skills (optional):    cd $root\studio ; npx skills add remotion-dev/skills"
