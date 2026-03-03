#!/bin/bash
# Wrapper para iniciar Expo con la IP pública correcta, ignorando CI del sistema
unset CI
unset CI_NAME  
unset CONTINUOUS_INTEGRATION

export REACT_NATIVE_PACKAGER_HOSTNAME=144.217.12.198
export HOME=/home/administrator

cd /home/administrator/app_gestion_sandor
exec /home/administrator/app_gestion_sandor/node_modules/.bin/expo start --host lan --non-interactive
