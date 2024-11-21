#!/bin/sh

# Remplacement des valeurs dynamiques pour apiUrl
sed -i "s|^.*window.__env.apiUrl = .*|window.__env.apiUrl = '$BACK_URL';|g" /app/src/assets/env.js

# Remplacement des valeurs dynamiques pour frontUrl
sed -i "s|^.*window.__env.frontUrl = .*|window.__env.frontUrl = '$FRONT_URL';|g" /app/src/assets/env.js

# Démarrer l'application
exec "$@"


##!/bin/sh
## Remplacement des variables dans le fichier env.js
#sed -i "s|\${BACK_URL}|$BACK_URL|g" /app/src/assets/env.js
#sed -i "s|\${FRONT_URL}|$FRONT_URL|g" /app/src/assets/env.js
#
## Démarrer l'application
#exec "$@"
