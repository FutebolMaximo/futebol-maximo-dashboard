@echo off
rem 1. Entra na pasta do projeto
cd /d "C:\Users\jose\Desktop\IA PROJECTS\youtube-retention-scraper"

rem 2. Força o repositório local a ficar 100% idêntico ao GitHub (ignora conflitos locais)
git fetch origin main
git reset --hard origin/main

rem 3. Copia automaticamente os CSVs para a pasta do KNIME
copy /Y "C:\Users\jose\Desktop\IA PROJECTS\youtube-retention-scraper\*.csv" "C:\Users\jose\Desktop\Suporte Knime\Futebol Maximo\"