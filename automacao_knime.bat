@echo off
echo [1/3] Iniciando o processamento do KNIME...
start /wait "" "C:\Program Files\KNIME\knime.exe" -consoleLog -nosplash -reset -application org.knime.product.KNIME_BATCH_APPLICATION -workflowDir="C:\Users\jose\knime-workspace\FUTEBOL MAXIMO"

echo [2/3] KNIME finalizado. Preparando envio para o GitHub...
cd /d "C:\Users\jose\Desktop\IA PROJECTS\Dashboard Futebol Maximo"

echo [3/3] Subindo as bases atualizadas para o Dashboard...
git add dados.csv fantasy.csv >> log-git.txt 2>&1
git commit -m "Atualizacao automatica das bases pelo KNIME - %date% %time%" >> log-git.txt 2>&1
git push origin main >> log-git.txt 2>&1

echo Processo 100%% concluido com sucesso! A tela fechara sozinha.
timeout /t 5 >nul
exit