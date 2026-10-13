@echo off
echo [1/3] Iniciando o processamento do KNIME...
REM O comando "start /wait" obriga o Windows a congelar este script e SÓ continuar quando o KNIME fechar
start /wait "" "C:\Program Files\KNIME\knime.exe" -consoleLog -nosplash -reset -application org.knime.product.KNIME_BATCH_APPLICATION -workflowDir="C:\Users\jose\knime-workspace\FUTEBOL MAXIMO"

echo [2/3] KNIME finalizado. Preparando envio para o GitHub...
REM Entra na pasta do Dashboard onde os arquivos finais foram salvos
cd /d "C:\Users\jose\Desktop\IA PROJECTS\Dashboard Futebol Maximo"

echo [3/3] Subindo as bases atualizadas para o Dashboard...
REM Adiciona APENAS os dois arquivos exatos para manter o GitHub limpo
git add dados.csv fantasy.csv
git commit -m "Atualizacao automatica das bases pelo KNIME - %date% %time%"
git push origin main

echo Processo 100%% concluido com sucesso! A tela fechara sozinha.
REM Substituimos o 'pause' pelo 'timeout'. Ele espera 5 segundos para voce conseguir ler e fecha sozinho.
timeout /t 5 >nul
exit