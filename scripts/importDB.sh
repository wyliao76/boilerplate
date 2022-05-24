#/bin/bash

ARRAY=()
ARRAY+=('table')

for item in "${ARRAY[@]}"
do
    echo $item
    # mongoimport --ssl --sslCAFile rds-combined-ca-bundle.pem --tlsInsecure -h 127.0.0.1:5558 -u 'master' -p "password" -d database -c "${item}" --file ./$item.json
    mongoimport -h 127.0.0.1:27017 -u 'root' -p '123456' --authenticationDatabase admin -d database -c "${item}" --file ./$item.json
    rm -rf ./$item.json
done
