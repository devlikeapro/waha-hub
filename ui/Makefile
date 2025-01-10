build:
	. ${NVM_DIR}/nvm.sh && nvm exec yarn generate

copy-waha:
	rm -rf  ../../whatsapp-http-api/dist/dashboard/*
	cp -Rv .output/public/* ../../whatsapp-http-api/dist/dashboard/
