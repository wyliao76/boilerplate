#/bin/bash

ARRAY=()
ARRAY+=('table')

for item in "${ARRAY[@]}"
do
    echo $item
    mongoexport --ssl --sslCAFile rds-combined-ca-bundle.pem --tlsInsecure -h 127.0.0.1:5558 -u 'master' -p "password" -d database -c "${item}" --out ./$item.json
    # mongoexport -h 127.0.0.1:27017 -u 'root' -p '123456' --authenticationDatabase admin -d database -c $item --out ./$item.json
done

# mongodump --ssl --sslCAFile rds-combined-ca-bundle.pem --tlsInsecure -h 127.0.0.1:5558 -u 'master' -d database -p "password"
# mongodump --ssl --tlsInsecure --authenticationDatabase admin -h 127.0.0.1:27017 -u root -p 123456 -d database
# mongorestore -h 127.0.0.1:27017 -u 'root' -p '123456' --authenticationDatabase admin dump
