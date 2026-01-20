build:
	. ${NVM_DIR}/nvm.sh && nvm exec yarn generate

copy-waha:
	rm -rf  ../../whatsapp-http-api/dist/dashboard/*
	cp -Rv .output/public/* ../../whatsapp-http-api/dist/dashboard/

copy-waha-src:
	cp -Rv .output/public/* ../../whatsapp-http-api/src/dashboard/

dev: build copy-waha copy-waha-src

update-swagger:
	wget http://admin:666@localhost:3000/-json -O - | jq '.' > ./openapi.json
