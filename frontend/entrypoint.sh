#!/bin/sh

# Replace dynamic values for apiUrl
sed -i "s|^.*window.__env.apiUrl = .*|window.__env.apiUrl = '$BACK_URL';|g" /app/src/assets/env.js

# Replace dynamic values for frontUrl
sed -i "s|^.*window.__env.frontUrl = .*|window.__env.frontUrl = '$FRONT_URL';|g" /app/src/assets/env.js

# Start the application
exec "$@"


##!/bin/sh
## Replace variables in the env.js file
#sed -i "s|\${BACK_URL}|$BACK_URL|g" /app/src/assets/env.js
#sed -i "s|\${FRONT_URL}|$FRONT_URL|g" /app/src/assets/env.js
#
## Start the application
#exec "$@"
