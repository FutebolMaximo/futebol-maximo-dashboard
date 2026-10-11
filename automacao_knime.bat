@echo off
REM 1. Roda o KNIME invisivelmente e limpa o cache
"C:\Program Files\KNIME\knime.exe" -consoleLog -nosplash -reset -application org.knime.product.KNIME_BATCH_APPLICATION -workflowDir="C:\Users\jose\knime-workspace\FUTEBOL MAXIMO"

REM 2. Entra na pasta correta onde os seus arquivos CSV sao salvos
cd /d "C:\Users\jose\Desktop\IA PROJECTS\Dashboard Futebol Maximo"

REM 3. Envia as atualizacoes para o GitHub
git add .
git commit -m "Atualizacao automatica %date% %time%"
git push origin main
pause
exit