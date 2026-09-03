# STAGE 6 ENVIRONMENT PREPARATION
## NATIVE TO LINUX MIGRATION

Based on the [Step 1 Environment Audit], the native host system operating the core MetronIQ architecture is structurally incompatible with the Deep Learning dependencies required for PaddleOCR Native execution. 

Specifically:
- **Missing:** `docker` daemon and CLI
- **Missing:** `wsl` (Windows Subsystem for Linux)
- **Constraint:** Win32/Python 3.13 combination actively triggers Intel OneDNN hardware-threading crashes when importing PyTorch and Paddle tensors.

To unblock REAL Artificial Intelligence capability without relying on spoofing or hallucination, the system must deploy the isolated Linux Container.

---

### REQUIRED HOST INSTALLATIONS

You (the Project Owner) must perform the following installations manually at the host OS level:

**1. Enable BIOS Virtualization:**
Ensure virtual architecture operations (Intel VT-x / AMD-V) are active in your machine's UEFI/BIOS.

**2. Install Windows Subsystem for Linux (WSL2):**
Open PowerShell as Administrator and execute:
```powershell
wsl --install
```
*This will automatically pull the necessary virtual machine kernels and install Ubuntu. Restart your computer if required.*

**3. Install Docker Desktop:**
- Download the official package: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Run the installer.
- Ensure the settings default to: `Use WSL 2 based engine` (Checked).
- Boot Docker Desktop and verify the daemon sits in your system tray (Green status).

---

### DOCKER ENVIRONMENT AUDIT

I have autonomously audited the provided AI configurations located in `backend/docker/`:
- `Dockerfile.ai`
- `requirements-ai.txt`
- `README-AI.md`

#### Readiness Verdict: PASS
The architecture correctly provisions a secure, detached inference container capable of bypassing the Windows thread blocks.

**Key Structural Audits Checked:**
1. **OS Base (`Dockerfile.ai`):** Properly utilizes `python:3.10-slim-bullseye`. This provides tremendous stability for C++ Python bindings compared to Python 3.13.
2. **System Dependencies:** Correctly provisions `libgl1-mesa-glx` and `libglib2.0-0` which are mandatory for `opencv-python` to process raw image structures headless.
3. **Python ML Dependencies (`requirements-ai.txt`):**
    - `paddlepaddle==2.6.0` & `paddleocr==2.7.3` (Stable engine bounds).
    - `ultralytics==8.2.0` (YOLO framework).
    - `opencv-python-headless==4.9.0.80` (Averts GUI blocking requests in detached linux).
    - `numpy<2.0.0` (CRITICAL FIX: Prevents tensor bounds breaking on Paddle arrays).

#### AI Engine Hook Requirement
Once the host Docker daemon is provisioned by the Human operator, we will be able to construct this container (`docker build -f backend/docker/Dockerfile.ai -t metroniq-ai .`) and pass End-to-End images precisely through the real AI loop.

*Note: The current `CMD` block in `Dockerfile.ai` attempts to run `ai.pipeline.scanner_pipeline:app` using Uvicorn. To properly expose this as an isolated microservice, a thin FastAPI wrapper (`ai_server.py`) will eventually need to be provisioned so `scanner.py` can Post images to it over localhost. We will configure this when Stage 6 proceeds to microservice routing.*
