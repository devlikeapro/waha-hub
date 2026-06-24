build:
	. ${NVM_DIR}/nvm.sh && nvm exec yarn generate

copy-waha:
	rm -rf  ../../whatsapp-http-api/dist/dashboard/*
	cp -Rv .output/public/* ../../whatsapp-http-api/dist/dashboard/

copy-waha-src:
	cp -Rv .output/public/* ../../whatsapp-http-api/src/dashboard/

copy-attivus-waha:
	mkdir -p ../../waha/src/dashboard
	rm -rf ../../waha/src/dashboard/*
	cp -Rv .output/public/* ../../waha/src/dashboard/

dev: build copy-attivus-waha

dev-all: build copy-waha copy-waha-src copy-attivus-waha

update-swagger:
	wget http://admin:666@localhost:3000/-json -O - | jq '.' > ./openapi.json
