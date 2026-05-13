@echo off
echo Iniciando Crediclass Dashboard Grupos...
cd /d "%~dp0backend"
pip install -r requirements.txt -q
python main.py
pause
